import redis from './redis';

const CANCELLED_NURSES_PREFIX = 'cancelled_nurse:';
const CANCELLATION_EXPIRY = 60 * 5; // 5 minutes in seconds

export class NurseCancellationService {
    private static getCancellationKey( appointmentId: string ): string {
        return `${CANCELLED_NURSES_PREFIX}${appointmentId}`;
    }

    public static async addCancelledNurse( appointmentId: string, nurseId: string ): Promise<void> {
        try {
            const key = this.getCancellationKey( appointmentId );

            // Get existing cancelled nurses for this appointment
            const existingNurses = await redis.smembers( key );

            // Add new nurse to the set
            await redis.sadd( key, nurseId );

            // Set expiry if this is the first cancellation
            if ( existingNurses.length === 0 ) {
                await redis.expire( key, CANCELLATION_EXPIRY );
            }

            console.log( `Nurse ${nurseId} added to cancelled list for appointment ${appointmentId}` );
        } catch ( error ) {
            console.error( 'Error adding cancelled nurse:', error );
            throw error;
        }
    }

    public static async getCancelledNurses( appointmentId: string ): Promise<string[]> {
        try {
            const key = this.getCancellationKey( appointmentId );
            return await redis.smembers( key );
        } catch ( error ) {
            console.error( 'Error getting cancelled nurses:', error );
            throw error;
        }
    }

    public static async clearCancelledNurses( appointmentId: string ): Promise<void> {
        try {
            const key = this.getCancellationKey( appointmentId );
            await redis.del( key );
            console.log( `Cleared cancelled nurses for appointment ${appointmentId}` );
        } catch ( error ) {
            console.error( 'Error clearing cancelled nurses:', error );
            throw error;
        }
    }
}
