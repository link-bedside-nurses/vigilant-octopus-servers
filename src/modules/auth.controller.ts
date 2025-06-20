import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { db } from '../database';
import { ACCOUNT } from '../interfaces';
import {
	AdminOTPVerificationSchema,
	AdminSigninSchema,
	AdminSignupSchema,
	PatientOTPVerificationSchema,
	PatientPhoneAuthSchema,
} from '../interfaces/dtos';
import { messagingService } from '../services/messaging';
import { createAccessToken } from '../services/token';
import { sendNormalized } from '../utils/http-response';
import { Password } from '../utils/password';

const router = Router();

// Patient Authentication Routes

// POST /auth/patient/signin - initiate patient signin with phone
router.post('/patient/signin', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = PatientPhoneAuthSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone } = result.data;

		let patient = await db.patients.findOne({ phone });
		let isNewUser = false;

		if (!patient) {
			isNewUser = true;
			const tempName = `User_${phone.slice(-4)}`;
			patient = await db.patients.create({
				phone,
				name: tempName,
				isPhoneVerified: false,
			});
		}

		const otpResult = await messagingService.sendOTPViaSMS(phone);

		if (!otpResult.success) {
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send OTP. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.OK,
			{
				exists: !isNewUser,
				message: 'OTP sent to your phone number',
				user: patient,
				expiresAt: otpResult.expiresAt,
			},
			isNewUser ? 'Account created and OTP sent for verification' : 'OTP sent for signin'
		);
	} catch (error) {
		console.error('Error in patient signin:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to send OTP. Please try again.'
		);
	}
});

// POST /auth/patient/verify-otp
router.post('/patient/verify-otp', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = PatientOTPVerificationSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone, otp, name } = result.data;

		const isValidOTP = await messagingService.verifyOTP(phone, otp);

		if (!isValidOTP) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		let patient = await db.patients.findOne({ phone });

		if (patient) {
			if (name && !patient.isPhoneVerified) {
				patient.name = name;
			}
			patient.isPhoneVerified = true;
			patient = await patient.save();

			await messagingService.expireOTP(phone);

			const accessToken = createAccessToken(patient as unknown as mongoose.Document & ACCOUNT);

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ user: patient, accessToken, isNewUser: false },
				'Successfully signed in'
			);
		} else {
			if (!name) {
				return sendNormalized(
					res,
					StatusCodes.BAD_REQUEST,
					null,
					'Name is required for new user registration'
				);
			}

			patient = await db.patients.create({
				phone,
				name,
				isPhoneVerified: true,
			});

			await messagingService.expireOTP(phone);

			const accessToken = createAccessToken(patient as unknown as mongoose.Document & ACCOUNT);

			return sendNormalized(
				res,
				StatusCodes.CREATED,
				{ user: patient, accessToken, isNewUser: true },
				'Account created and signed in successfully'
			);
		}
	} catch (error) {
		console.error('Error in patient OTP verification:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
});

// POST /auth/patient/signup
router.post('/patient/signup', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		return sendNormalized(
			res,
			StatusCodes.METHOD_NOT_ALLOWED,
			null,
			'Please use the OTP-based signin flow for new patient registration'
		);
	} catch (error) {
		return next(error);
	}
});

// Admin Authentication Routes

// POST /auth/admin/signin
router.post('/admin/signin', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminSigninSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, password } = result.data;

		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return sendNormalized(res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials');
		}

		if (!admin.isEmailVerified) {
			return sendNormalized(
				res,
				StatusCodes.UNAUTHORIZED,
				null,
				'Please verify your email before signing in'
			);
		}

		const match = await Password.verify(admin.password, password);

		if (!match) {
			return sendNormalized(res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials');
		}

		const accessToken = createAccessToken(admin as unknown as mongoose.Document & ACCOUNT);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: admin, accessToken },
			'Signed in successfully'
		);
	} catch (error) {
		console.error('Error in admin signin:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'An error occurred during signin'
		);
	}
});

// POST /auth/admin/signup
router.post('/admin/signup', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminSignupSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, password } = result.data;

		const existingAdmin = await db.admins.findOne({ email });

		if (existingAdmin) {
			return sendNormalized(res, StatusCodes.BAD_REQUEST, null, 'Email already in use');
		}

		const hash = await Password.hash(password);

		const admin = await db.admins.create({ email, password: hash });

		const otpResult = await messagingService.sendOTPViaEmail(email);

		if (!otpResult.success) {
			await db.admins.findByIdAndDelete(admin.id);
			return sendNormalized(
				res,
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send verification email. Please try again.'
			);
		}

		return sendNormalized(
			res,
			StatusCodes.CREATED,
			{ user: admin, expiresAt: otpResult.expiresAt },
			'Admin account created. Please check your email for verification OTP.'
		);
	} catch (error) {
		console.error('Error in admin signup:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'An error occurred during signup'
		);
	}
});

// POST /auth/admin/verify-otp
router.post('/admin/verify-otp', async (req: Request, res: Response, _next: NextFunction) => {
	try {
		const result = AdminOTPVerificationSchema.safeParse(req.body);

		if (!result.success) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, otp } = result.data;

		const isValidOTP = await messagingService.verifyOTP(email, otp);

		if (!isValidOTP) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin account not found');
		}

		admin.isEmailVerified = true;
		await admin.save();

		await messagingService.expireOTP(email);

		const accessToken = createAccessToken(admin as unknown as mongoose.Document & ACCOUNT);

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: admin, accessToken },
			'Email verified successfully. You can now sign in.'
		);
	} catch (error) {
		console.error('Error in admin OTP verification:', error);
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
});

export default router;
