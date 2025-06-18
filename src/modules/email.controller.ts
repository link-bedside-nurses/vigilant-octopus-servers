import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../services/token';
import { ACCOUNT } from '../interfaces';
import { response } from '../utils/http-response';
import { AdminRepo } from '../database/repositories/admin-repository';
import { VerifyEmailSchema } from '../interfaces/dtos';
import startEmailVerification from '../utils/startEmailVerification';
import { getOTP } from '../services/otp';
import mongoose from 'mongoose';

const router = Router();

// GET /email/ - send email
router.get( '/', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const result = VerifyEmailSchema.omit( { otp: true } ).safeParse( req.query );
        if ( !result.success ) {
            return response(
                StatusCodes.BAD_REQUEST,
                null,
                `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
            );
        }
        const { email } = req.query as { email: string };
        try {
            await startEmailVerification( email );
            return response( StatusCodes.OK, null, 'Email sent successfully!' );
        } catch ( error ) {
            return response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                error as unknown as Error,
                'Failed to send email'
            );
        }
    } catch ( err ) {
        return next( err );
    }
} );

// POST /email/verify - verify email
router.post( '/verify', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const result = VerifyEmailSchema.safeParse( req.query );
        if ( !result.success ) {
            return response(
                StatusCodes.BAD_REQUEST,
                null,
                `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
            );
        }
        try {
            const otp = await getOTP( result.data.email );
            if ( !otp ) {
                return response(
                    StatusCodes.BAD_REQUEST,
                    null,
                    'Wrong or Expired OTP. Try resending the OTP request'
                );
            }
            if ( otp === result.data.otp ) {
                const user = await AdminRepo.getAdminByEmail( result.data.email );
                if ( !user ) {
                    return response(
                        StatusCodes.OK,
                        null,
                        'No such user with given email. Please try registering again after 5 mins'
                    );
                }
                user.isEmailVerified = true;
                await user.save();
                const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );
                return response( StatusCodes.OK, { user, accessToken }, 'OTP has been Verified' );
            }
            return response( StatusCodes.BAD_REQUEST, null, 'Wrong OTP' );
        } catch ( error ) {
            return response( StatusCodes.INTERNAL_SERVER_ERROR, null, 'FAILED TO VERIFY OTP' );
        }
    } catch ( err ) {
        return next( err );
    }
} );

// GET /email/otp - get email verification OTP
router.get( '/otp', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const result = VerifyEmailSchema.safeParse( req.query );
        if ( !result.success ) {
            return response(
                StatusCodes.BAD_REQUEST,
                null,
                `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
            );
        }
        await startEmailVerification( result.data.email );
        return response( StatusCodes.OK, null, 'Check email for OTP' );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
