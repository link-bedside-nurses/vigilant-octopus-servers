import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../api/adapters/express-callback';
import { response } from '../../../core/utils/http-response';
import { CaregiverRepo } from '../../../infra/database/repositories/caregiver-repository';
import { z } from 'zod';

const GetNearestCaregiverSchema = z.object( {
    lat: z.string(),
    lng: z.string(),
    radius: z.string().optional(), // radius in meters, optional
} );

export function getNearestCaregiver() {
    return async function ( req: HTTPRequest<object, object, z.infer<typeof GetNearestCaregiverSchema>> ) {
        console.log( 'nearest caregiver request query params', req.query );
        try {
            const result = GetNearestCaregiverSchema.safeParse( req.query );

            console.log( 'nearest caregiver validation result', result );

            if ( !result.success ) {
                console.log( 'nearest caregiver validation result', result.error.issues[0] );
                return response(
                    StatusCodes.BAD_REQUEST,
                    null,
                    `Invalid request: ${result.error.issues[0].message}`
                );
            }

            const { lat, lng, radius } = result.data;

            const availableCaregivers = await CaregiverRepo.getNearestAvailableCaregivers(
                Number( lat ),
                Number( lng ),
                "1",
                Number( radius )
            );

            console.log( 'availableCaregivers', availableCaregivers );

            if ( !availableCaregivers.length ) {
                return response(
                    StatusCodes.NOT_FOUND,
                    null,
                    'No available caregivers found in your area'
                );
            }

            const nearestCaregiver = availableCaregivers[0];

            const formattedCaregiver = {
                ...nearestCaregiver,
                distance: {
                    meters: Math.round( nearestCaregiver.distance ),
                    kilometers: Math.round( nearestCaregiver.distance / 1000 * 10 ) / 10
                }
            };

            console.log( 'formattedCaregiver', formattedCaregiver );

            return response(
                StatusCodes.OK,
                formattedCaregiver,
                'Nearest available caregiver found'
            );
        } catch ( error: any ) {
            console.error( 'Error getting nearest caregiver:', error );
            return response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                null,
                'Failed to get nearest caregiver'
            );
        }
    };
}
