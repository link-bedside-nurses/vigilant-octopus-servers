import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { db } from '../database';
import { ACCOUNT } from '../interfaces';
import {
	AdminOTPVerificationSchema,
	AdminSigninSchema,
	AdminSignupSchema,
	PatientSigninSchema,
	PatientSignupSchema,
} from '../interfaces/dtos';
import { messagingService } from '../services/messaging';
import { createAccessToken } from '../services/token';
import { sendNormalized } from '../utils/http-response';
import { Password } from '../utils/password';

const router = Router();

// Patient Authentication Routes

// POST /auth/patient/signin - legacy phone+password
router.post( '/patient/signin', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = PatientSigninSchema.safeParse( req.body );
		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}
		const { phone, password } = result.data;
		const patient = await db.patients.findOne( { phone } );
		if ( !patient ) {
			return sendNormalized( res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials!' );
		}

		const match = await Password.verify( patient.password, password );
		if ( !match ) {
			return sendNormalized( res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials!' );
		}
		const accessToken = createAccessToken( patient as unknown as mongoose.Document & ACCOUNT );
		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: patient, accessToken },
			'Signed in successfully.'
		);
	} catch ( error ) {
		console.error( 'Error in patient signin:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to sign in. Please try again.'
		);
	}
} );

// POST /auth/patient/signup - legacy phone+password
router.post( '/patient/signup', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = PatientSignupSchema.safeParse( req.body );
		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}
		const { name, phone, password } = result.data;
		const existingPatient = await db.patients.findOne( { phone } );
		if ( existingPatient ) {
			return sendNormalized( res, StatusCodes.BAD_REQUEST, null, 'Phone already in use' );
		}
		const hash = await Password.hash( password );
		const patient = await db.patients.create( { name, phone, password: hash } );
		const accessToken = createAccessToken( patient as unknown as mongoose.Document & ACCOUNT );
		return sendNormalized(
			res,
			StatusCodes.CREATED,
			{ user: patient, accessToken },
			'Account created and signed in successfully.'
		);
	} catch ( error ) {
		console.error( 'Error in patient signup:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to sign up. Please try again.'
		);
	}
} );

// Admin Authentication Routes

// POST /auth/admin/signin
router.post( '/admin/signin', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = AdminSigninSchema.safeParse( req.body );

		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, password } = result.data;

		const admin = await db.admins.findOne( { email } );

		if ( !admin ) {
			return sendNormalized( res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials' );
		}

		if ( !admin.isEmailVerified ) {
			return sendNormalized(
				res,
				StatusCodes.UNAUTHORIZED,
				null,
				'Please verify your email before signing in'
			);
		}

		const match = await Password.verify( admin.password, password );

		if ( !match ) {
			return sendNormalized( res, StatusCodes.UNAUTHORIZED, null, 'Invalid credentials' );
		}

		const accessToken = createAccessToken( admin as unknown as mongoose.Document & ACCOUNT );

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: admin, accessToken },
			'Signed in successfully'
		);
	} catch ( error ) {
		console.error( 'Error in admin signin:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'An error occurred during signin'
		);
	}
} );

// POST /auth/admin/signup
router.post( '/admin/signup', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = AdminSignupSchema.safeParse( req.body );

		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, password } = result.data;

		const existingAdmin = await db.admins.findOne( { email } );

		if ( existingAdmin ) {
			return sendNormalized( res, StatusCodes.BAD_REQUEST, null, 'Email already in use' );
		}

		const hash = await Password.hash( password );

		const admin = await db.admins.create( { email, password: hash } );

		const otpResult = await messagingService.sendOTPViaEmail( email );

		if ( !otpResult.success ) {
			await db.admins.findByIdAndDelete( admin.id );
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
	} catch ( error ) {
		console.error( 'Error in admin signup:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'An error occurred during signup'
		);
	}
} );

// POST /auth/admin/verify-otp
router.post( '/admin/verify-otp', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = AdminOTPVerificationSchema.safeParse( req.body );

		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { email, otp } = result.data;

		const isValidOTP = await messagingService.verifyOTP( email, otp );

		if ( !isValidOTP ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		const admin = await db.admins.findOne( { email } );

		if ( !admin ) {
			return sendNormalized( res, StatusCodes.NOT_FOUND, null, 'Admin account not found' );
		}

		admin.isEmailVerified = true;
		await admin.save();

		await messagingService.expireOTP( email );

		const accessToken = createAccessToken( admin as unknown as mongoose.Document & ACCOUNT );

		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: admin, accessToken },
			'Email verified successfully. You can now sign in.'
		);
	} catch ( error ) {
		console.error( 'Error in admin OTP verification:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
} );

export default router;
