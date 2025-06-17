import { HTTPRequest } from '../../../../express-callback';
import { StatusCodes } from 'http-status-codes';
import { response } from '../../../../utils/http-response';
import { CaregiverRepo } from '../../../../database/repositories/caregiver-repository';
import { z } from 'zod';

const TimeSchema = z.string().regex( /^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)' );

const DayScheduleSchema = z.object( {
    enabled: z.boolean(),
    start: TimeSchema,
    end: TimeSchema
} ).refine( data => {
    if ( !data.enabled ) return true;
    return data.start <= data.end;
}, {
    message: "End time must be after start time"
} );

const AvailabilitySchema = z.object( {
    monday: DayScheduleSchema,
    tuesday: DayScheduleSchema,
    wednesday: DayScheduleSchema,
    thursday: DayScheduleSchema,
    friday: DayScheduleSchema,
    saturday: DayScheduleSchema,
    sunday: DayScheduleSchema
} );

export function updateAvailability() {
    return async function ( request: HTTPRequest<{ id: string }, z.infer<typeof AvailabilitySchema>> ) {
        try {
            const result = AvailabilitySchema.safeParse( request.body );
            if ( !result.success ) {
                return response(
                    StatusCodes.BAD_REQUEST,
                    null,
                    `Invalid availability data: ${result.error.issues[0].message}`
                );
            }

            const caregiver = await CaregiverRepo.updateAvailability(
                request.params.id,
                result.data
            );

            if ( !caregiver ) {
                return response(
                    StatusCodes.OK,
                    null,
                    'Caregiver not found'
                );
            }

            return response(
                StatusCodes.OK,
                caregiver,
                'Availability updated successfully'
            );
        } catch ( error: any ) {
            console.error( 'Error updating availability:', error );
            return response(
                StatusCodes.INTERNAL_SERVER_ERROR,
                null,
                'Failed to update availability'
            );
        }
    };
}
