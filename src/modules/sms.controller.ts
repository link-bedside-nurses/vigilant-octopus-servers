import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { response } from '../utils/http-response';
import { createAccessToken } from '../services/token';
import { ACCOUNT } from '../interfaces';
import { getOTP, generateOTP, storeOTP } from '../services/otp';
import sendOTP from '../services/sms';
import { VerifyPhoneSchema, PhoneVerifcationOTPSchema } from '../interfaces/dtos';
import { NurseRepo } from '../database/repositories/nurse-repository';
import { PatientRepo } from '../database/repositories/patient-repository';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const router = Router();

// POST /sms/verify - verify OTP from phone
router.post( '/verify', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const result = VerifyPhoneSchema.safeParse( req.query );
        if ( !result.success ) {
            return response(
                StatusCodes.OK,
                null,
                `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
            );
        }
        if ( ![
            DESIGNATION.PATIENT
        ].includes( result.data.designation as DESIGNATION ) ) {
            return response(
                StatusCodes.BAD_REQUEST,
                null,
                'Only patients or nurses can access this route'
            );
        }
        let user;
        if ( result.data.designation === DESIGNATION.NURSE ) {
            user = await NurseRepo.getNurseByPhone( result.data.phone );
        } else if ( result.data.designation === DESIGNATION.PATIENT ) {
            user = await PatientRepo.getPatientByPhone( result.data.phone );
        }
        if ( !user ) {
            return response( StatusCodes.OK, null, 'User not found' );
        }
        const storedOTP = await getOTP( result.data.phone );
        if ( storedOTP && storedOTP !== result.data.otp ) {
            return response(
                StatusCodes.BAD_REQUEST,
                null,
                'Wrong or Expired OTP. Try resending the OTP request'
            );
        }
        user.isVerified = true;
        user = await user.save();
        const accessToken = createAccessToken( user as mongoose.Document & ACCOUNT );
        return response( StatusCodes.OK, { user, accessToken }, 'OTP has been Verified' );
    } catch ( err ) {
        return next( err );
    }
} );

// POST /sms/request - request phone verification OTP
router.post( '/request', async ( req: Request, _res: Response, next: NextFunction ) => {
    try {
        const result = PhoneVerifcationOTPSchema.safeParse( req.query );
        if ( !result.success ) {
            return response(
                StatusCodes.BAD_REQUEST,
                null,
                `${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
            );
        }
        const user = await PatientRepo.getPatientByPhone( result.data.toPhone );
        if ( !user ) {
            return response( StatusCodes.OK, null, 'User not found' );
        }
        const otp = generateOTP();
        await storeOTP( result.data.toPhone, otp );
        logger.info( `OTP Expiring for phone: ${result.data.toPhone} in  2 minutes from now` );
        const otpResponse = await sendOTP( result.data.toPhone, otp );
        return response(
            StatusCodes.OK,
            JSON.parse( otpResponse.config.data ),
            'OTP generated successfully!'
        );
    } catch ( err ) {
        return next( err );
    }
} );

export default router;
