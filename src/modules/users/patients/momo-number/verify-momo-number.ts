import { HTTPRequest } from '../../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../../utils/http-response';
import { PatientRepo } from '../../../../database/repositories/patient-repository';
import { z } from 'zod';
import redis from '../../../../services/redis';

const VerifyMomoNumberSchema = z.object( {
    otp: z.string().length( 6 )
} );

export function verifyMomoNumber() {
    return async function ( request: HTTPRequest<{ id: string }, z.infer<typeof VerifyMomoNumberSchema>> ) {
        try {
            const result = VerifyMomoNumberSchema.safeParse( request.body );
            if ( !result.success ) {
                return response(
                    StatusCodes.BAD_REQUEST,
                    null,
                    'Invalid OTP format'
                );
            }

            const patient = await PatientRepo.getPatientById( request.params.id );
            if ( !patient || !patient.momoNumber ) {
                return response( StatusCodes.OK, null, 'Patient or mobile money number not found' );
            }

            // Verify OTP
            const storedOTP = await redis.get( `otp:${patient.momoNumber}` );
            if ( !storedOTP || storedOTP !== result.data.otp ) {
                return response( StatusCodes.BAD_REQUEST, null, 'Invalid or expired OTP' );
            }

            // Mark momo number as verified
            const updatedPatient = await PatientRepo.updatePatient( request.params.id, {
                isMomoNumberVerified: true
            } );

            // Clear OTP
            await redis.del( `otp:${patient.momoNumber}` );

            return response(
                StatusCodes.OK,
                updatedPatient,
                'Mobile money number verified successfully'
            );
        } catch ( error: any ) {
            console.error( 'Error verifying mobile money number:', error );
            return response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                null,
                'Failed to verify mobile money number'
            );
        }
    };
}
