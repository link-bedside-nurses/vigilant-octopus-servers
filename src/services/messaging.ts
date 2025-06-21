import axios from 'axios';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import envars from '../config/env-vars';
import { html } from '../config/html';
import logger from '../utils/logger';

const redis = new Redis({
	host: process.env.REDIS_HOST || '127.0.0.1',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	password: process.env.REDIS_PASSWORD,
	maxRetriesPerRequest: 3,
	connectTimeout: 10000,
	lazyConnect: true,
});

redis.on('error', (err) => {
	logger.error('Redis Client Error:', err);
	// Don't crash the app, just log the error
});

redis.on('connect', () => {
	logger.info('✅ Connected to Redis');
});

redis.on('ready', () => {
	logger.info('✅ Redis is ready to accept connections');
});

redis.on('close', () => {
	logger.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', () => {
	logger.info('🔄 Reconnecting to Redis...');
});

const emailTransporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: envars.SENDER_EMAIL,
		pass: envars.APP_PASSWORD,
	},
});

const OTP_EXPIRY_TIME = 300;
const OTP_LENGTH = 6;

export enum MessageType {
	OTP = 'otp',
	NOTIFICATION = 'notification',
	ALERT = 'alert',
	WELCOME = 'welcome',
	VERIFICATION = 'verification',
}

export enum ChannelType {
	SMS = 'sms',
	EMAIL = 'email',
	BOTH = 'both',
}

export enum MessagePriority {
	LOW = 'low',
	NORMAL = 'normal',
	HIGH = 'high',
	URGENT = 'urgent',
}

export enum MessageStatus {
	PENDING = 'pending',
	SENT = 'sent',
	FAILED = 'failed',
	DELIVERED = 'delivered',
}

export interface MessageTemplate {
	subject?: string;
	text: string;
	html?: string;
}

export interface MessageOptions {
	priority?: MessagePriority;
	expiryTime?: number;
	channel?: ChannelType;
	template?: MessageTemplate;
	metadata?: Record<string, any>;
}

export interface MessageResult {
	success: boolean;
	messageId?: string;
	status: MessageStatus;
	error?: string;
	channel: ChannelType;
	timestamp: Date;
}

export interface OTPResult {
	success: boolean;
	otp?: string;
	expiresAt: Date;
	error?: string;
}

class MessagingService {
	private static instance: MessagingService;

	private constructor() {}

	public static getInstance(): MessagingService {
		if (!MessagingService.instance) {
			MessagingService.instance = new MessagingService();
		}
		return MessagingService.instance;
	}

	/**
	 * Generate OTP
	 */
	private generateOTP(): string {
		return randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
	}

	/**
	 * Store OTP in Redis
	 */
	private async storeOTP(
		identifier: string,
		otp: string,
		expiryTime: number = OTP_EXPIRY_TIME
	): Promise<void> {
		const key = `otp:${identifier}`;
		await redis.setex(key, expiryTime, otp);
		logger.info(`OTP ${otp} stored for ${identifier}, expires in ${expiryTime} seconds`);
	}

	/**
	 * Get OTP from Redis
	 */
	public async getOTP(identifier: string): Promise<string | null> {
		const key = `otp:${identifier}`;
		const otp = await redis.get(key);
		return otp;
	}

	/**
	 * Verify OTP
	 */
	public async verifyOTP(identifier: string, suppliedOTP: string): Promise<boolean> {
		const storedOTP = await this.getOTP(identifier);
		if (!storedOTP) {
			logger.warn(`No OTP found for ${identifier}`);
			return false;
		}
		return storedOTP === suppliedOTP;
	}

	/**
	 * Expire OTP
	 */
	public async expireOTP(identifier: string): Promise<void> {
		const key = `otp:${identifier}`;
		await redis.del(key);
		logger.info(`OTP expired for ${identifier}`);
	}

	/**
	 * Send SMS via Infobip
	 */
	private async sendSMS(phone: string, message: string): Promise<MessageResult> {
		try {
			logger.info(`Sending SMS to ${phone}`);

			const response = await axios.post(
				envars.INFOBIP_URL,
				{
					messages: [
						{
							destinations: [{ to: phone }],
							from: 'ServiceSMS',
							text: message,
						},
					],
				},
				{
					headers: {
						Authorization: `App ${envars.INFOBIP_SECRET_KEY}`,
						'Content-Type': 'application/json',
						Accept: 'application/json',
					},
					maxRedirects: 20,
					timeout: 10000,
				}
			);

			logger.info(`SMS sent successfully to ${phone}`);
			return {
				success: true,
				messageId: response.data?.messages?.[0]?.messageId,
				status: MessageStatus.SENT,
				channel: ChannelType.SMS,
				timestamp: new Date(),
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown SMS error';
			logger.error(`SMS sending failed to ${phone}:`, errorMessage);
			return {
				success: false,
				status: MessageStatus.FAILED,
				error: errorMessage,
				channel: ChannelType.SMS,
				timestamp: new Date(),
			};
		}
	}

	/**
	 * Send Email
	 */
	private async sendEmail(
		to: string,
		subject: string,
		text: string,
		htmlContent?: string
	): Promise<MessageResult> {
		try {
			logger.info(`Sending email to ${to}`);

			const info = await emailTransporter.sendMail({
				from: `"LinkBedside Nurses" <${envars.SENDER_EMAIL}>`,
				to,
				subject,
				text,
				html: htmlContent,
				bcc: '',
				cc: '',
				attachments: [],
			});

			logger.info(`Email sent successfully to ${to}, Message ID: ${info.messageId}`);
			return {
				success: true,
				messageId: info.messageId,
				status: MessageStatus.SENT,
				channel: ChannelType.EMAIL,
				timestamp: new Date(),
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown email error';
			logger.error(`Email sending failed to ${to}:`, errorMessage);
			return {
				success: false,
				status: MessageStatus.FAILED,
				error: errorMessage,
				channel: ChannelType.EMAIL,
				timestamp: new Date(),
			};
		}
	}

	/**
	 * Send OTP via SMS
	 */
	public async sendOTPViaSMS(
		phone: string,
		expiryTime: number = OTP_EXPIRY_TIME
	): Promise<OTPResult> {
		try {
			const otp = this.generateOTP();
			await this.storeOTP(phone, otp, expiryTime);

			const message = `Your verification code is ${otp}. Valid for ${Math.floor(expiryTime / 60)} minutes.`;
			const result = await this.sendSMS(phone, message);

			if (result.success) {
				return {
					success: true,
					otp,
					expiresAt: new Date(Date.now() + expiryTime * 1000),
				};
			} else {
				await this.expireOTP(phone);
				return {
					success: false,
					expiresAt: new Date(),
					error: result.error,
				};
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			logger.error(`OTP SMS sending failed to ${phone}:`, errorMessage);
			return {
				success: false,
				expiresAt: new Date(),
				error: errorMessage,
			};
		}
	}

	/**
	 * Send OTP via Email
	 */
	public async sendOTPViaEmail(
		email: string,
		expiryTime: number = OTP_EXPIRY_TIME
	): Promise<OTPResult> {
		try {
			const otp = this.generateOTP();
			await this.storeOTP(email, otp, expiryTime);

			const subject = 'Email Verification Code';
			const text = `Your verification code is ${otp}. Valid for ${Math.floor(expiryTime / 60)} minutes.`;
			const htmlContent = html(otp);

			const result = await this.sendEmail(email, subject, text, htmlContent);

			if (result.success) {
				return {
					success: true,
					otp,
					expiresAt: new Date(Date.now() + expiryTime * 1000),
				};
			} else {
				// await this.expireOTP(email);
				return {
					success: false,
					expiresAt: new Date(),
					error: result.error,
				};
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			logger.error(`OTP email sending failed to ${email}:`, errorMessage);
			return {
				success: false,
				expiresAt: new Date(),
				error: errorMessage,
			};
		}
	}

	/**
	 * Send notification message
	 */
	public async sendNotification(
		recipient: string,
		message: string,
		options: MessageOptions = {}
	): Promise<MessageResult[]> {
		const {
			channel = ChannelType.BOTH,
			priority = MessagePriority.NORMAL,
			template,
			metadata = {},
		} = options;

		const results: MessageResult[] = [];

		const isEmail = recipient.includes('@');
		const isPhone = /^\+?[\d\s\-()]+$/.test(recipient);

		if (!isEmail && !isPhone) {
			throw new Error('Invalid recipient format. Must be email or phone number.');
		}

		const subject = template?.subject || 'Notification';
		const text = template?.text || message;
		const htmlContent = template?.html;

		if (channel === ChannelType.SMS || (channel === ChannelType.BOTH && isPhone)) {
			const smsResult = await this.sendSMS(recipient, text);
			results.push(smsResult);
		}

		if (channel === ChannelType.EMAIL || (channel === ChannelType.BOTH && isEmail)) {
			const emailResult = await this.sendEmail(recipient, subject, text, htmlContent);
			results.push(emailResult);
		}

		logger.info(`Notification sent to ${recipient} with priority ${priority}`, {
			recipient,
			priority,
			channel,
			results: results.map((r) => ({ success: r.success, status: r.status })),
			metadata,
		});

		return results;
	}

	/**
	 * Send bulk notifications
	 */
	public async sendBulkNotifications(
		recipients: string[],
		message: string,
		options: MessageOptions = {}
	): Promise<{ recipient: string; results: MessageResult[] }[]> {
		const results = [];

		for (const recipient of recipients) {
			try {
				const recipientResults = await this.sendNotification(recipient, message, options);
				results.push({ recipient, results: recipientResults });
			} catch (error) {
				logger.error(`Failed to send notification to ${recipient}:`, error);
				results.push({
					recipient,
					results: [
						{
							success: false,
							status: MessageStatus.FAILED,
							error: error instanceof Error ? error.message : 'Unknown error',
							channel: ChannelType.BOTH,
							timestamp: new Date(),
						},
					],
				});
			}
		}

		return results;
	}

	/**
	 * Get message statistics
	 */
	public async getMessageStats(): Promise<{
		totalMessages: number;
		successfulMessages: number;
		failedMessages: number;
		otpCount: number;
	}> {
		return {
			totalMessages: 0,
			successfulMessages: 0,
			failedMessages: 0,
			otpCount: 0,
		};
	}

	/**
	 * Health check for messaging service
	 */
	public async healthCheck(): Promise<{
		redis: boolean;
		email: boolean;
		sms: boolean;
	}> {
		const health = {
			redis: false,
			email: false,
			sms: false,
		};

		try {
			await redis.ping();
			health.redis = true;
		} catch (error) {
			logger.error('Redis health check failed:' + error);
			console.error(error);
		}

		try {
			await emailTransporter.verify();
			health.email = true;
		} catch (error) {
			logger.error('Email health check failed:' + error);
			console.error(error);
		}

		try {
			await axios.get(envars.INFOBIP_URL.replace('/sms/2/text/advanced', '/account/1/balance'), {
				headers: {
					Authorization: `App ${envars.INFOBIP_SECRET_KEY}`,
				},
				timeout: 5000,
			});
			health.sms = true;
		} catch (error) {
			logger.error('SMS health check failed:' + error);
		}

		return health;
	}

	/**
	 * Cleanup method for graceful shutdown
	 */
	public async cleanup(): Promise<void> {
		try {
			await redis.quit();
			logger.info('Redis connection closed');
		} catch (error) {
			logger.error('Error closing Redis connection:', error);
		}
	}
}

export const messagingService = MessagingService.getInstance();
