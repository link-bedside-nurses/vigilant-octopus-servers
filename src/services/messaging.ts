import axios from 'axios';
import { randomInt } from 'crypto';
import Redis from 'ioredis';
import nodemailer from 'nodemailer';
import envars from '../config/env-vars';
import { html } from '../config/html';
import logger from '../utils/logger';

// Use the global Redis instance from server.ts
const getRedis = (): Redis => {
	if (!(global as any).redis) {
		throw new Error('Redis not initialized. Make sure the server has started.');
	}
	return (global as any).redis;
};

const emailTransporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: envars.SENDER_EMAIL,
		pass: envars.APP_PASSWORD,
	},
});

const OTP_EXPIRY_TIME = 300; // seconds
const OTP_LENGTH = 5; // digits
const OTP_RATE_LIMIT_TTL = 60; // seconds
const OTP_RATE_LIMIT_MAX = 5; // requests per TTL window

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

	// EgoSMS API configuration
	private readonly egoSmsApiUrl = 'https://www.egosms.co/api/v1/json/';
	private readonly smsDefaultPriority = '1';

	/**
	 * Generate OTP
	 */
	private generateOTP(): string {
		return randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
	}

	/**
	 * Rate limit OTP requests per identifier
	 */
	private async checkAndIncrementOtpRate(identifier: string): Promise<void> {
		const rateKey = `otp:rate:${identifier}`;
		const rateStr = await getRedis().get(rateKey);
		const rate = parseInt(rateStr || '0', 10);
		logger.info(`OTP request rate for ${identifier}: ${rate}`);
		if (rate >= OTP_RATE_LIMIT_MAX) {
			throw new Error('Too many OTP requests. Please try again later.');
		}
		await getRedis().set(rateKey, (rate + 1).toString(), 'EX', OTP_RATE_LIMIT_TTL);
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
		await getRedis().setex(key, expiryTime, otp);
		logger.info(`OTP ${otp} stored for ${identifier}, expires in ${expiryTime} seconds`);
	}

	/**
	 * Get OTP from Redis
	 */
	public async getOTP(identifier: string): Promise<string | null> {
		const key = `otp:${identifier}`;
		const otp = await getRedis().get(key);
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
		await getRedis().del(key);
		logger.info(`OTP expired for ${identifier}`);
	}

	/**
	 * Normalize phone number to E.164-like format (best effort)
	 */
	private normalizePhone(input: string): string {
		const digits = (input || '').replace(/\D+/g, '');
		if (input.startsWith('+')) return `+${digits}`;
		if (digits.startsWith('0') && envars.FROM_SMS_PHONE?.startsWith('+')) {
			// naive local-to-international conversion: replace leading 0 with sender country code
			const country = envars.FROM_SMS_PHONE.replace(/\D+/g, '').slice(0, 3);
			return `+${country}${digits.slice(1)}`;
		}
		return `+${digits}`;
	}

	/**
	 * Send SMS via EgoSMS provider
	 */
	private async sendSMS(phone: string, message: string): Promise<MessageResult> {
		try {
			logger.info(`Sending SMS to ${phone}`);

			const payload = {
				method: 'SendSms',
				userdata: {
					username: envars.SMS_USERNAME,
					password: envars.SMS_PASSWORD,
				},
				msgdata: [
					{
						number: this.normalizePhone(phone),
						message,
						senderid: envars.SMS_SENDER_ID,
						priority: this.smsDefaultPriority,
					},
				],
			};

			const response = await axios.post(this.egoSmsApiUrl, payload, {
				timeout: 10000,
				headers: { 'Content-Type': 'application/json' },
			});

			logger.info(`EgoSMS response: ${JSON.stringify(response.data)}`);
			return {
				success: response.data?.Status === 'OK' || response.status === 200,
				status: MessageStatus.SENT,
				channel: ChannelType.SMS,
				timestamp: new Date(),
			};
		} catch (error: any) {
			let errorMessage = 'Unknown SMS error';
			if (error?.response) {
				errorMessage = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
			} else if (error?.request) {
				errorMessage = 'Network error - no response received';
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			logger.error(`SMS sending failed to ${phone}: ${errorMessage}`);
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
			await this.checkAndIncrementOtpRate(phone);
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
			await this.checkAndIncrementOtpRate(email);
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
				await this.expireOTP(email);
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
	 * Send password setup email to new admin
	 */
	public async sendPasswordSetupEmail(
		email: string,
		token: string,
		expiresAt: Date
	): Promise<MessageResult> {
		try {
			logger.info(`Sending password setup email to ${email}`);

			const appUrl = envars.APP_URL || 'http://localhost:3000';
			const setupLink = `${appUrl}/set-password?token=${token}`;
			const expiryMinutes = Math.floor((expiresAt.getTime() - Date.now()) / 60000);

			const subject = 'Set Up Your Admin Account Password';
			const text = `Welcome to LinkBedside Nurses Admin Portal!\n\nYou have been invited to join as an administrator. Please set up your password by clicking the link below:\n\n${setupLink}\n\nThis link will expire in ${expiryMinutes} minutes.\n\nAfter setting your password, your account will need to be activated by a super administrator before you can sign in.\n\nIf you did not request this, please ignore this email.`;

			const htmlContent = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
		.content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
		.button { display: inline-block; color:#f9f9f9; padding: 12px 30px; background-color: #4F46E5; text-decoration: none; border-radius: 5px; margin: 20px 0; }
		.warning { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
		.footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>Welcome to LinkBedside Nurses</h1>
		</div>
		<div class="content">
			<h2>Set Up Your Admin Account</h2>
			<p>You have been invited to join the LinkBedside Nurses Admin Portal as an administrator.</p>
			<p>To get started, please set up your password by clicking the button below:</p>
			<div style="text-align: center;">
				<a href="${setupLink}" class="button">Set Up Password</a>
			</div>
			<p>Or copy and paste this link into your browser:</p>
			<p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 3px;">${setupLink}</p>
			<div class="warning">
				<strong>⏰ Important:</strong> This link will expire in <strong>${expiryMinutes} minutes</strong>.
			</div>
			<p><strong>Next Steps:</strong></p>
			<ol>
				<li>Click the link above to set your password</li>
				<li>Wait for a super administrator to activate your account</li>
				<li>Once activated, you can sign in and start managing the system</li>
			</ol>
			<p>If you did not request this account, please ignore this email.</p>
		</div>
		<div class="footer">
			<p>© ${new Date().getFullYear()} LinkBedside Nurses. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
			`;

			const result = await this.sendEmail(email, subject, text, htmlContent);

			if (result.success) {
				logger.info(`Password setup email sent successfully to ${email}`);
			} else {
				logger.error(`Failed to send password setup email to ${email}:`, result.error);
			}

			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			logger.error(`Password setup email failed for ${email}:`, errorMessage);
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
	 * Send account activation notification to admin
	 */
	public async sendAccountActivationEmail(
		email: string,
		adminName?: string
	): Promise<MessageResult> {
		try {
			logger.info(`Sending account activation email to ${email}`);

			const appUrl = envars.APP_URL || 'http://localhost:3000';
			const signinLink = `${appUrl}/admin/signin`;

			const subject = 'Your Admin Account Has Been Activated';
			const greeting = adminName ? `Dear ${adminName}` : 'Hello';
			const text = `${greeting},\n\nGood news! Your administrator account has been activated.\n\nYou can now sign in to the LinkBedside Nurses Admin Portal at:\n${signinLink}\n\nUse the email address (${email}) and the password you set up earlier to access your account.\n\nWelcome to the team!`;

			const htmlContent = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
		.content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
		.button { display: inline-block; padding: 12px 30px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
		.success { background-color: #D1FAE5; padding: 15px; border-left: 4px solid #10B981; margin: 20px 0; }
		.footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🎉 Account Activated!</h1>
		</div>
		<div class="content">
			<h2>${greeting},</h2>
			<div class="success">
				<strong>✅ Good news!</strong> Your administrator account has been activated.
			</div>
			<p>You can now sign in to the LinkBedside Nurses Admin Portal and start managing the system.</p>
			<div style="text-align: center;">
				<a href="${signinLink}" class="button">Sign In Now</a>
			</div>
			<p><strong>Your login credentials:</strong></p>
			<ul>
				<li><strong>Email:</strong> ${email}</li>
				<li><strong>Password:</strong> The password you set up earlier</li>
			</ul>
			<p>If you have any questions or need assistance, please contact your super administrator.</p>
			<p>Welcome to the team!</p>
		</div>
		<div class="footer">
			<p>© ${new Date().getFullYear()} LinkBedside Nurses. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
			`;

			const result = await this.sendEmail(email, subject, text, htmlContent);

			if (result.success) {
				logger.info(`Account activation email sent successfully to ${email}`);
			} else {
				logger.error(`Failed to send activation email to ${email}:`, result.error);
			}

			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			logger.error(`Account activation email failed for ${email}:`, errorMessage);
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
			await getRedis().ping();
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
			// Minimal health check: attempt to reach EgoSMS API endpoint
			await axios.get(this.egoSmsApiUrl, { timeout: 5000 });
			health.sms = Boolean(envars.SMS_USERNAME && envars.SMS_PASSWORD && envars.SMS_SENDER_ID);
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
			await getRedis().quit();
			logger.info('Redis connection closed');
		} catch (error) {
			logger.error('Error closing Redis connection:', error);
		}
	}
}

export const messagingService = MessagingService.getInstance();
