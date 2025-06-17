import { HTTPRequest } from '../../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../../utils/http-response';
import { PatientRepo } from '../../../../database/repositories/patient-repository';
import { z } from 'zod';
import startEmailVerification from '../../../../utils/startEmailVerification';

const MomoNumberSchema = z.object( {
    momoNumber: z.string().regex( /^(256|0)?(7[0578])\d{7}$/, 'Invalid Uganda phone number' )
} );

export function configureMomoNumber() {
    return async function ( request: HTTPRequest<{ id: string }, z.infer<typeof MomoNumberSchema>> ) {
        try {
            const result = MomoNumberSchema.safeParse( request.body );
            if ( !result.success ) {
                return response(
                    StatusCodes.BAD_REQUEST,
                    null,
                    `Invalid mobile money number: ${result.error.issues[0].message}`
                );
            }

            const patient = await PatientRepo.getPatientById( request.params.id );
            if ( !patient ) {
                return response( StatusCodes.OK, null, 'Patient not found' );
            }

            // Update momo number and set it as unverified
            const updatedPatient = await PatientRepo.updatePatient( request.params.id, {
                momoNumber: result.data.momoNumber,
                isMomoNumberVerified: false
            } );

            // Send verification OTP
            await startEmailVerification( result.data.momoNumber );

            return response(
                StatusCodes.OK,
                updatedPatient,
                'Mobile money number configured and verification code sent'
            );
        } catch ( error: any ) {
            console.error( 'Error configuring mobile money number:', error );
            return response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                null,
                'Failed to configure mobile money number'
            );
        }
    };
}
