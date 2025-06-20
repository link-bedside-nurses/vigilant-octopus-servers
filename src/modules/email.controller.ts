import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { db } from '../database';
import { ACCOUNT } from '../interfaces';
import { VerifyEmailSchema } from '../interfaces/dtos';
import { ChannelType, messagingService } from '../services/messaging';
import { createAccessToken } from '../services/token';
import { sendNormalized } from '../utils/http-response';

const router = Router();

// GET /email/ - send email verification OTP
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = VerifyEmailSchema.omit({ otp: true }).safeParse(req.query);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email } = req.query as { email: string };

		try {
			// Use the new messaging service to send OTP via email
			const otpResult = await messagingService.sendOTPViaEmail(email);

			if (!otpResult.success) {
				return sendNormalized(
					res,
					StatusCodes.INTERNAL_SERVER_ERROR,
					null,
					otpResult.error || 'Failed to send email verification OTP'
				);
			}

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					message: 'Email verification OTP sent successfully!',
					expiresAt: otpResult.expiresAt,
				},
				'Email verification OTP sent successfully!'
			);
		} catch (error) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send email verification OTP'
			);
		}
	} catch (err) {
		return next(err);
	}
});

// POST /email/verify - verify email OTP
router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = VerifyEmailSchema.safeParse(req.query);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email, otp } = result.data;

		try {
			// Use the new messaging service to verify OTP
			const isValidOTP = await messagingService.verifyOTP(email, otp);

			if (!isValidOTP) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Wrong or expired OTP. Try resending the OTP request'
				);
			}

			// Find and update user
			const user = await db.admins.findOne({ email });
			if (!user) {
				return sendNormalized(
					res,
					StatusCodes.NOT_FOUND,
					null,
					'No such user with given email. Please try registering again after 5 mins'
				);
			}

			// Mark email as verified
			user.isEmailVerified = true;
			await user.save();

			// Expire the OTP after successful verification
			await messagingService.expireOTP(email);

			// Create access token
			const accessToken = createAccessToken(user as unknown as mongoose.Document & ACCOUNT);

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ user, accessToken },
				'Email verified successfully!'
			);
		} catch (error) {
			return sendNormalized(res, StatusCodes.INTERNAL_SERVER_ERROR, null, 'Failed to verify OTP');
		}
	} catch (err) {
		return next(err);
	}
});

// GET /email/otp - resend email verification OTP
router.get('/otp', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = VerifyEmailSchema.safeParse(req.query);
		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email } = result.data;

		try {
			// Use the new messaging service to send OTP via email
			const otpResult = await messagingService.sendOTPViaEmail(email);

			if (!otpResult.success) {
				return sendNormalized(
					res,
					StatusCodes.INTERNAL_SERVER_ERROR,
					null,
					otpResult.error || 'Failed to send email verification OTP'
				);
			}

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					message: 'Email verification OTP resent successfully!',
					expiresAt: otpResult.expiresAt,
				},
				'Check email for OTP'
			);
		} catch (error) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to resend email verification OTP'
			);
		}
	} catch (err) {
		return next(err);
	}
});

// POST /email/send-notification - send custom email notification
router.post('/send-notification', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { recipient, subject, message, html } = req.body;

		if (!recipient || !message) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Recipient and message are required'
			);
		}

		try {
			// Use the new messaging service to send notification
			const results = await messagingService.sendNotification(recipient, message, {
				channel: ChannelType.EMAIL,
				template: {
					subject: subject || 'Notification',
					text: message,
					html: html,
				},
			});

			const successCount = results.filter((r) => r.success).length;

			if (successCount === 0) {
				return sendNormalized(
					res,
					StatusCodes.INTERNAL_SERVER_ERROR,
					null,
					'Failed to send email notification'
				);
			}

			return sendNormalized(
				res,
				StatusCodes.OK,
				{
					results,
					successCount,
					totalCount: results.length,
				},
				'Email notification sent successfully!'
			);
		} catch (error) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send email notification'
			);
		}
	} catch (err) {
		return next(err);
	}
});

export default router;
