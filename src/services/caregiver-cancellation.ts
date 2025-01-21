import redis from './redis';

const CANCELLED_CAREGIVERS_PREFIX = 'cancelled_caregiver:';
const CANCELLATION_EXPIRY = 60 * 5; // 5 minutes in seconds

export class CaregiverCancellationService {
    private static getCancellationKey( appointmentId: string ): string {
        return `${CANCELLED_CAREGIVERS_PREFIX}${appointmentId}`;
    }

    public static async addCancelledCaregiver( appointmentId: string, caregiverId: string ): Promise<void> {
        try {
            const key = this.getCancellationKey( appointmentId );

            // Get existing cancelled caregivers for this appointment
            const existingCaregivers = await redis.smembers( key );

            // Add new caregiver to the set
            await redis.sadd( key, caregiverId );

            // Set expiry if this is the first cancellation
            if ( existingCaregivers.length === 0 ) {
                await redis.expire( key, CANCELLATION_EXPIRY );
            }

            console.log( `Caregiver ${caregiverId} added to cancelled list for appointment ${appointmentId}` );
        } catch ( error ) {
            console.error( 'Error adding cancelled caregiver:', error );
            throw error;
        }
    }

    public static async getCancelledCaregivers( appointmentId: string ): Promise<string[]> {
        try {
            const key = this.getCancellationKey( appointmentId );
            return await redis.smembers( key );
        } catch ( error ) {
            console.error( 'Error getting cancelled caregivers:', error );
            throw error;
        }
    }

    public static async clearCancelledCaregivers( appointmentId: string ): Promise<void> {
        try {
            const key = this.getCancellationKey( appointmentId );
            await redis.del( key );
            console.log( `Cleared cancelled caregivers for appointment ${appointmentId}` );
        } catch ( error ) {
            console.error( 'Error clearing cancelled caregivers:', error );
            throw error;
        }
    }
}
