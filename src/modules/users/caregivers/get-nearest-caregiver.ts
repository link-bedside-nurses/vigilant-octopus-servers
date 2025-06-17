import { StatusCodes } from 'http-status-codes';
import { HTTPRequest } from '../../../express-callback';
import { response } from '../../../utils/http-response';
import { CaregiverRepo } from '../../../database/repositories/caregiver-repository';
import { z } from 'zod';

const GetNearestCaregiverSchema = z.object( {
    lat: z.string(),
    lng: z.string(),
    radius: z.string().optional(), // radius in meters, optional
    limit: z.string().transform( val => {
        const num = parseInt( val );
        // Ensure limit is at least 1 and no more than 20
        return Math.min( Math.max( num, 1 ), 20 );
    } ).optional().default( '1' ) // Default to 1 if not provided
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

            const { lat, lng, radius, limit } = result.data;

            const availableCaregivers = await CaregiverRepo.getNearestAvailableCaregivers(
                Number( lat ),
                Number( lng ),
                "1",
                Number( radius )
            );

            console.log( 'availableCaregivers', availableCaregivers );

            if ( !availableCaregivers.length ) {
                return response(
                    StatusCodes.OK,
                    [],
                    'No available caregivers found in your area'
                );
            }

            // Get the specified number of caregivers
            const limitedCaregivers = availableCaregivers.slice( 0, Number( limit ) );

            // Format the caregivers with distance information
            const formattedCaregivers = limitedCaregivers.map( caregiver => ( {
                ...caregiver,
                distance: {
                    meters: Math.round( caregiver.distance ),
                    kilometers: Math.round( caregiver.distance / 1000 * 10 ) / 10
                }
            } ) );

            console.log( 'formattedCaregivers', formattedCaregivers );

            return response(
                StatusCodes.OK,
                formattedCaregivers,
                `Found ${formattedCaregivers.length} nearest available caregiver(s)`
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
