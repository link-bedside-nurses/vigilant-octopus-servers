import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { ChannelType, MessagePriority, messagingService } from '../services/messaging';
import { normalizedResponse } from '../utils/http-response';

const router = Router();

// Validation schemas
const SendNotificationSchema = z.object({
	recipient: z.string().min(1, 'Recipient is required'),
	message: z.string().min(1, 'Message is required'),
	channel: z.enum(['sms', 'email', 'both']).optional(),
	priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
	subject: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});

const SendBulkNotificationSchema = z.object({
	recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
	message: z.string().min(1, 'Message is required'),
	channel: z.enum(['sms', 'email', 'both']).optional(),
	priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
	subject: z.string().optional(),
	metadata: z.record(z.any()).optional(),
});

const SendOTPSchema = z.object({
	identifier: z.string().min(1, 'Identifier (email or phone) is required'),
	channel: z.enum(['sms', 'email']).optional(),
	expiryTime: z.number().min(60).max(3600).optional(), // 1 minute to 1 hour
});

const VerifyOTPSchema = z.object({
	identifier: z.string().min(1, 'Identifier (email or phone) is required'),
	otp: z.string().min(4, 'OTP is required'),
});

// POST /messaging/send-notification - Send a single notification
router.post('/send-notification', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = SendNotificationSchema.safeParse(req.body);

		if (!result.success) {
			return res.send(
				normalizedResponse(
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
				)
			);
		}

		const { recipient, message, channel, priority, subject, metadata } = result.data;

		// Determine channel type
		const channelType =
			channel === 'sms'
				? ChannelType.SMS
				: channel === 'email'
					? ChannelType.EMAIL
					: ChannelType.BOTH;

		// Determine priority
		const messagePriority =
			priority === 'low'
				? MessagePriority.LOW
				: priority === 'high'
					? MessagePriority.HIGH
					: priority === 'urgent'
						? MessagePriority.URGENT
						: MessagePriority.NORMAL;

		// Prepare template if subject is provided
		const template = subject ? { subject, text: message } : undefined;

		const results = await messagingService.sendNotification(recipient, message, {
			channel: channelType,
			priority: messagePriority,
			template,
			metadata,
		});

		const successCount = results.filter((r) => r.success).length;
		const failureCount = results.length - successCount;

		return res.send(
			normalizedResponse(
				StatusCodes.OK,
				{
					recipient,
					results,
					summary: {
						total: results.length,
						successful: successCount,
						failed: failureCount,
					},
				},
				`Notification sent. ${successCount} successful, ${failureCount} failed.`
			)
		);
	} catch (error) {
		console.error('Error sending notification:', error);
		return res.send(
			normalizedResponse(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send notification. Please try again.'
			)
		);
	}
});

// POST /messaging/send-bulk-notifications - Send bulk notifications
router.post(
	'/send-bulk-notifications',
	async (req: Request, res: Response, _next: NextFunction) => {
		try {
			const result = SendBulkNotificationSchema.safeParse(req.body);

			if (!result.success) {
				return res.send(
					normalizedResponse(
						StatusCodes.BAD_REQUEST,
						null,
						`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
					)
				);
			}

			const { recipients, message, channel, priority, subject, metadata } = result.data;

			// Determine channel type
			const channelType =
				channel === 'sms'
					? ChannelType.SMS
					: channel === 'email'
						? ChannelType.EMAIL
						: ChannelType.BOTH;

			// Determine priority
			const messagePriority =
				priority === 'low'
					? MessagePriority.LOW
					: priority === 'high'
						? MessagePriority.HIGH
						: priority === 'urgent'
							? MessagePriority.URGENT
							: MessagePriority.NORMAL;

			// Prepare template if subject is provided
			const template = subject ? { subject, text: message } : undefined;

			const results = await messagingService.sendBulkNotifications(recipients, message, {
				channel: channelType,
				priority: messagePriority,
				template,
				metadata,
			});

			const totalRecipients = results.length;
			const successfulRecipients = results.filter((r) =>
				r.results.some((result) => result.success)
			).length;
			const failedRecipients = totalRecipients - successfulRecipients;

			return res.send(
				normalizedResponse(
					StatusCodes.OK,
					{
						recipients,
						results,
						summary: {
							totalRecipients,
							successfulRecipients,
							failedRecipients,
						},
					},
					`Bulk notifications sent. ${successfulRecipients} successful, ${failedRecipients} failed.`
				)
			);
		} catch (error) {
			console.error('Error sending bulk notifications:', error);
			return res.send(
				normalizedResponse(
					StatusCodes.INTERNAL_SERVER_ERROR,
					null,
					'Failed to send bulk notifications. Please try again.'
				)
			);
		}
	}
);

// POST /messaging/send-otp - Send OTP
router.post('/send-otp', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = SendOTPSchema.safeParse(req.body);

		if (!result.success) {
			return res.send(
				normalizedResponse(
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
				)
			);
		}

		const { identifier, channel, expiryTime } = result.data;

		// Determine if identifier is email or phone
		const isEmail = identifier.includes('@');
		const isPhone = /^\+?[\d\s\-()]+$/.test(identifier);

		if (!isEmail && !isPhone) {
			return res.send(
				normalizedResponse(
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid identifier format. Must be email or phone number.'
				)
			);
		}

		let otpResult;

		if (channel === 'sms' || (!channel && isPhone)) {
			otpResult = await messagingService.sendOTPViaSMS(identifier, expiryTime);
		} else if (channel === 'email' || (!channel && isEmail)) {
			otpResult = await messagingService.sendOTPViaEmail(identifier, expiryTime);
		} else {
			return res.send(
				normalizedResponse(StatusCodes.BAD_REQUEST, null, 'Invalid channel for identifier type.')
			);
		}

		if (!otpResult.success) {
			return res.send(
				normalizedResponse(
					StatusCodes.INTERNAL_SERVER_ERROR,
					null,
					otpResult.error || 'Failed to send OTP. Please try again.'
				)
			);
		}

		return res.send(
			normalizedResponse(
				StatusCodes.OK,
				{
					identifier,
					channel: channel || (isEmail ? 'email' : 'sms'),
					expiresAt: otpResult.expiresAt,
				},
				'OTP sent successfully.'
			)
		);
	} catch (error) {
		console.error('Error sending OTP:', error);
		return res.send(
			normalizedResponse(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send OTP. Please try again.'
			)
		);
	}
});

// POST /messaging/verify-otp - Verify OTP
router.post('/verify-otp', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = VerifyOTPSchema.safeParse(req.body);

		if (!result.success) {
			return res.send(
				normalizedResponse(
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
				)
			);
		}

		const { identifier, otp } = result.data;

		const isValid = await messagingService.verifyOTP(identifier, otp);

		if (!isValid) {
			return res.send(
				normalizedResponse(
					StatusCodes.BAD_REQUEST,
					null,
					'Invalid or expired OTP. Please try again.'
				)
			);
		}

		// Expire the OTP after successful verification
		await messagingService.expireOTP(identifier);

		return res.send(
			normalizedResponse(
				StatusCodes.OK,
				{ identifier, verified: true },
				'OTP verified successfully.'
			)
		);
	} catch (error) {
		console.error('Error verifying OTP:', error);
		return res.send(
			normalizedResponse(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to verify OTP. Please try again.'
			)
		);
	}
});

// GET /messaging/health - Health check for messaging service
router.get('/health', async (_req: Request, res: Response, _next: NextFunction) => {
	try {
		const health = await messagingService.healthCheck();

		const isHealthy = health.redis && health.email && health.sms;

		return res.send(
			normalizedResponse(
				isHealthy ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE,
				{
					status: isHealthy ? 'healthy' : 'unhealthy',
					services: health,
					timestamp: new Date().toISOString(),
				},
				isHealthy ? 'Messaging service is healthy' : 'Messaging service has issues'
			)
		);
	} catch (error) {
		console.error('Error checking messaging health:', error);
		return res.send(
			normalizedResponse(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to check messaging service health.'
			)
		);
	}
});

// GET /messaging/stats - Get messaging statistics
router.get('/stats', async (_req: Request, res: Response, _next: NextFunction) => {
	try {
		const stats = await messagingService.getMessageStats();

		return res.send(
			normalizedResponse(
				StatusCodes.OK,
				{
					...stats,
					timestamp: new Date().toISOString(),
				},
				'Messaging statistics retrieved successfully.'
			)
		);
	} catch (error) {
		console.error('Error getting messaging stats:', error);
		return res.send(
			normalizedResponse(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to get messaging statistics.'
			)
		);
	}
});

export default router;
