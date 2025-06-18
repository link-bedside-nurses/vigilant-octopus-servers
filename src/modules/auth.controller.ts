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
import { response } from '../utils/http-response';
import { Password } from '../utils/password';

const router = Router();

// Patient Authentication Routes

// POST /auth/patient/signin - initiate patient signin with phone
router.post('/patient/signin', async (req: Request, _res: Response, _next: NextFunction) => {
	try {
		const result = PatientPhoneAuthSchema.safeParse(req.body);

		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { phone } = result.data;

		// Check if patient exists
		let patient = await db.patients.findOne({ phone });
		let isNewUser = false;

		// If patient doesn't exist, create a new account
		if (!patient) {
			isNewUser = true;
			// Generate a temporary name based on phone number
			const tempName = `User_${phone.slice(-4)}`;

			// Create new patient account
			patient = await db.patients.create({
				phone,
				name: tempName,
				isPhoneVerified: false, // Will be verified after OTP
			});
		}

		// Send OTP for verification using the new messaging service
		const otpResult = await messagingService.sendOTPViaSMS(phone);

		if (!otpResult.success) {
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send OTP. Please try again.'
			);
		}

		return response(
			StatusCodes.OK,
			{
				exists: !isNewUser, // true if account already existed
				message: 'OTP sent to your phone number',
				user: patient,
				expiresAt: otpResult.expiresAt,
			},
			isNewUser ? 'Account created and OTP sent for verification' : 'OTP sent for signin'
		);
	} catch (error) {
		console.error('Error in patient signin:', error);
		return response(
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to send OTP. Please try again.'
		);
	}
});

// POST /auth/patient/verify-otp - verify patient OTP and sign in/up
router.post('/patient/verify-otp', async (req: Request, _res: Response, _next: NextFunction) => {
	try {
		const result = PatientOTPVerificationSchema.safeParse(req.body);

		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { phone, otp, name } = result.data;

		// Verify OTP using the new messaging service
		const isValidOTP = await messagingService.verifyOTP(phone, otp);

		if (!isValidOTP) {
			return response(StatusCodes.BAD_REQUEST, null, 'Invalid or expired OTP. Please try again.');
		}

		// Check if patient exists
		let patient = await db.patients.findOne({ phone });

		if (patient) {
			// Update patient info if name is provided (for new users)
			if (name && !patient.isPhoneVerified) {
				patient.name = name;
			}

			// Mark phone as verified and sign them in
			patient.isPhoneVerified = true;
			patient = await patient.save();

			// Expire the OTP
			await messagingService.expireOTP(phone);

			const accessToken = createAccessToken(patient as mongoose.Document & ACCOUNT);

			return response(
				StatusCodes.OK,
				{ user: patient, accessToken, isNewUser: !patient.isPhoneVerified },
				'Successfully signed in'
			);
		} else {
			// This shouldn't happen since we create accounts during signin
			// But handle it as a fallback
			if (!name) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Name is required for new user registration'
				);
			}

			// Create new patient as fallback
			patient = await db.patients.create({
				phone,
				name,
				isPhoneVerified: true,
			});

			// Expire the OTP
			await messagingService.expireOTP(phone);

			const accessToken = createAccessToken(patient as mongoose.Document & ACCOUNT);

			return response(
				StatusCodes.CREATED,
				{ user: patient, accessToken, isNewUser: true },
				'Account created and signed in successfully'
			);
		}
	} catch (error) {
		console.error('Error in patient OTP verification:', error);
		return response(
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
});

// POST /auth/patient/signup - legacy patient signup (kept for backward compatibility)
router.post('/patient/signup', async (_req: Request, _res: Response, next: NextFunction) => {
	try {
		// This route is kept for backward compatibility
		// New patients should use the OTP-based flow
		return response(
			StatusCodes.METHOD_NOT_ALLOWED,
			null,
			'Please use the OTP-based signin flow for new patient registration'
		);
	} catch (error) {
		return next(error);
	}
});

// Admin Authentication Routes

// POST /auth/admin/signin - admin signin with email and password
router.post('/admin/signin', async (req: Request, _res: Response, _next: NextFunction) => {
	try {
		const result = AdminSigninSchema.safeParse(req.body);

		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email, password } = result.data;

		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid credentials');
		}

		// Check if email is verified
		if (!admin.isEmailVerified) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Please verify your email before signing in');
		}

		const match = await Password.verify(admin.password, password);

		if (!match) {
			return response(StatusCodes.UNAUTHORIZED, null, 'Invalid credentials');
		}

		const accessToken = createAccessToken(admin as mongoose.Document & ACCOUNT);

		return response(StatusCodes.OK, { user: admin, accessToken }, 'Signed in successfully');
	} catch (error) {
		console.error('Error in admin signin:', error);
		return response(StatusCodes.INTERNAL_SERVER_ERROR, null, 'An error occurred during signin');
	}
});

// POST /auth/admin/signup - admin signup with email verification
router.post('/admin/signup', async (req: Request, _res: Response, _next: NextFunction) => {
	try {
		const result = AdminSignupSchema.safeParse(req.body);

		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email, password } = result.data;

		// Check if admin already exists
		const existingAdmin = await db.admins.findOne({ email });

		if (existingAdmin) {
			return response(StatusCodes.BAD_REQUEST, null, 'Email already in use');
		}

		const hash = await Password.hash(password);

		const admin = await db.admins.create({
			email,
			password: hash,
		});

		// Send OTP via email using the new messaging service
		const otpResult = await messagingService.sendOTPViaEmail(email);

		if (!otpResult.success) {
			// If OTP sending fails, delete the created admin and return error
			await db.admins.findByIdAndDelete(admin._id);
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to send verification email. Please try again.'
			);
		}

		return response(
			StatusCodes.CREATED,
			{
				user: admin,
				expiresAt: otpResult.expiresAt,
			},
			'Admin account created. Please check your email for verification OTP.'
		);
	} catch (error) {
		console.error('Error in admin signup:', error);
		return response(StatusCodes.INTERNAL_SERVER_ERROR, null, 'An error occurred during signup');
	}
});

// POST /auth/admin/verify-otp - verify admin email OTP
router.post('/admin/verify-otp', async (req: Request, _res: Response, _next: NextFunction) => {
	try {
		const result = AdminOTPVerificationSchema.safeParse(req.body);

		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
			);
		}

		const { email, otp } = result.data;

		// Verify OTP using the new messaging service
		const isValidOTP = await messagingService.verifyOTP(email, otp);

		if (!isValidOTP) {
			return response(StatusCodes.BAD_REQUEST, null, 'Invalid or expired OTP. Please try again.');
		}

		// Get admin and verify email
		const admin = await db.admins.findOne({ email });

		if (!admin) {
			return response(StatusCodes.NOT_FOUND, null, 'Admin account not found');
		}

		// Mark email as verified
		admin.isEmailVerified = true;
		await admin.save();

		// Expire the OTP
		await messagingService.expireOTP(email);

		// Create access token
		const accessToken = createAccessToken(admin as mongoose.Document & ACCOUNT);

		return response(
			StatusCodes.OK,
			{ user: admin, accessToken },
			'Email verified successfully. You can now sign in.'
		);
	} catch (error) {
		console.error('Error in admin OTP verification:', error);
		return response(
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
});

export default router;
