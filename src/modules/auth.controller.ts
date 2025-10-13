import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { db } from '../database';
import { ACCOUNT } from '../interfaces';
import {
    AdminOTPVerificationSchema,
    AdminSigninSchema,
    AdminSignupSchema,
    AdminPasswordResetRequestSchema,
    AdminPasswordResetSchema,
    PatientOTPVerificationSchema,
    PatientPhoneAuthSchema,
    PatientSetNameSchema, // <-- add this
} from '../interfaces/dtos';
import { messagingService } from '../services/messaging';
import envars from '../config/env-vars';
import { createAccessToken } from '../services/token';
import { sendNormalized } from '../utils/http-response';
import { Password } from '../utils/password';

const router = Router();

// Patient Authentication Routes

// POST /auth/patient/signin - initiate patient signin with phone
router.post( '/patient/signin', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = PatientPhoneAuthSchema.safeParse( req.body );

		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone } = result.data;

		let patient = await db.patients.findOne( { phone } );

		if ( !patient ) {
			patient = await db.patients.create( {
				phone,
			} );
		}

		const otpResult = await messagingService.sendOTPViaSMS( phone );

		if ( !otpResult.success ) {
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
				message: 'OTP sent to your phone number',
				user: patient,
				expiresAt: otpResult.expiresAt,
			},
			'Check your phone for OTP'
		);
	} catch ( error ) {
		console.error( 'Error in patient signin:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to send OTP. Please try again.'
		);
	}
} );

// POST /auth/patient/verify-otp
router.post( '/patient/verify-otp', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = PatientOTPVerificationSchema.safeParse( req.body );

		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}

		const { phone, otp } = result.data;

		const isValidOTP = await messagingService.verifyOTP( phone, otp );

		if ( !isValidOTP ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				'Invalid or expired OTP. Please try again.'
			);
		}

		let patient = await db.patients.findOne( { phone } );

		if ( patient ) {
			patient.isPhoneVerified = true;
			patient = await patient.save();

			await messagingService.expireOTP( phone );

			return sendNormalized(
				res,
				StatusCodes.OK,
				{ user: patient },
				'Phone verified'
			);
		} else {
			patient = await db.patients.create( {
				phone,
				isPhoneVerified: true,
			} );

			await messagingService.expireOTP( phone );

			return sendNormalized(
				res,
				StatusCodes.CREATED,
				{ user: patient },
				'Phone verified'
			);
		}
	} catch ( error ) {
		console.error( 'Error in patient OTP verification:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to verify OTP. Please try again.'
		);
	}
} );

// POST /auth/patient/set-name
router.post( '/patient/set-name', async ( req: Request, res: Response, _next: NextFunction ) => {
	try {
		const result = PatientSetNameSchema.safeParse( req.body );
		if ( !result.success ) {
			return sendNormalized(
				res,
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
				result.error
			);
		}
		const { phone, name } = result.data;
		const patient = await db.patients.findOne( { phone } );
		if ( !patient ) {
			return sendNormalized(
				res,
				StatusCodes.NOT_FOUND,
				null,
				'Patient not found. Please verify your phone first.'
			);
		}
		if ( !patient.isPhoneVerified ) {
			return sendNormalized(
				res,
				StatusCodes.FORBIDDEN,
				null,
				'Phone not verified. Please verify your phone first.'
			);
		}
		patient.name = name;
		await patient.save();
		const accessToken = createAccessToken( patient as unknown as mongoose.Document & ACCOUNT );
		return sendNormalized(
			res,
			StatusCodes.OK,
			{ user: patient, accessToken },
			'Account created and signed in successfully.'
		);
	} catch ( error ) {
		console.error( 'Error in patient set-name:', error );
		return sendNormalized(
			res,
			StatusCodes.INTERNAL_SERVER_ERROR,
			null,
			'Failed to set name. Please try again.'
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
            const otpResult = await messagingService.sendOTPViaEmail( email );
            if ( !otpResult.success ) {
                return sendNormalized(
                    res,
                    StatusCodes.INTERNAL_SERVER_ERROR,
                    null,
                    'Failed to send verification email. Please try again.'
                );
            }

            return sendNormalized(
                res,
                StatusCodes.UNAUTHORIZED,
                { expiresAt: otpResult.expiresAt },
                'Email not verified. Verification OTP has been sent.'
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

router.post('/admin/forgot-password', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = AdminPasswordResetRequestSchema.safeParse(req.body);
    if (!result.success) {
      return sendNormalized(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
        result.error
      );
    }

    const { email } = result.data;
    const admin = await db.admins.findOne({ email });
    if (!admin) {
      return sendNormalized(res, StatusCodes.NOT_FOUND, null, 'Admin account not found');
    }

    const otpResult = await messagingService.sendOTPViaEmail(email, envars.OTP_EXPIRY_SECONDS);
    if (!otpResult.success) {
      return sendNormalized(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        null,
        'Failed to send reset OTP. Please try again.'
      );
    }

    return sendNormalized(
      res,
      StatusCodes.OK,
      { expiresAt: otpResult.expiresAt },
      'Password reset OTP sent to your email'
    );
  } catch (error) {
    console.error('Error in admin forgot-password:', error);
    return sendNormalized(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      null,
      'Failed to initiate password reset. Please try again.'
    );
  }
});

// POST /auth/admin/reset-password - submit OTP and new password
router.post('/admin/reset-password', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = AdminPasswordResetSchema.safeParse(req.body);
    if (!result.success) {
      return sendNormalized(
        res,
        StatusCodes.BAD_REQUEST,
        null,
        `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase(),
        result.error
      );
    }

    const { email, otp, newPassword } = result.data;
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

    const hash = await Password.hash(newPassword);
    admin.password = hash;
    await admin.save();
    await messagingService.expireOTP(email);

    return sendNormalized(
      res,
      StatusCodes.OK,
      { user: admin },
      'Password reset successful. You can now sign in.'
    );
  } catch (error) {
    console.error('Error in admin reset-password:', error);
    return sendNormalized(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      null,
      'Failed to reset password. Please try again.'
    );
  }
});

export default router;
