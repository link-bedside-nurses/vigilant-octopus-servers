import cron from 'node-cron';
import { db } from '../infra/database';
import { CaregiverRepo } from '../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../infra/database/repositories/patient-repository';

/**
 * Process accounts that have been marked for deletion
 * This function deletes accounts that were marked for deletion more than 7 days ago
 */
async function processAccountDeletions() {
    try {
        console.info( 'Running account deletion job' );

        // Get the date 7 days ago
        const cutoffDate = new Date();
        cutoffDate.setDate( cutoffDate.getDate() - 7 );

        // Find caregivers marked for deletion older than 7 days
        const caregiversToDelete = await db.caregivers.find( {
            markedForDeletion: true,
            deletionRequestDate: { $lte: cutoffDate }
        } );

        // Find patients marked for deletion older than 7 days
        const patientsToDelete = await db.patients.find( {
            markedForDeletion: true,
            deletionRequestDate: { $lte: cutoffDate }
        } );

        // Log the number of accounts to be deleted
        console.info( `Found ${caregiversToDelete.length} caregivers and ${patientsToDelete.length} patients to delete` );

        // Delete each caregiver
        for ( const caregiver of caregiversToDelete ) {
            console.info( `Deleting caregiver: ${caregiver._id}` );
            await CaregiverRepo.deleteCaregiver( caregiver._id.toString() );
        }

        // Delete each patient
        for ( const patient of patientsToDelete ) {
            console.info( `Deleting patient: ${patient._id}` );
            await PatientRepo.deletePatient( patient._id.toString() );
        }

        console.info( `Successfully deleted ${caregiversToDelete.length} caregivers and ${patientsToDelete.length} patients` );
    } catch ( error ) {
        console.error( 'Error processing account deletions:', error );
    }
}

/**
 * Schedule the account deletion job to run daily at midnight
 * Returns the scheduled task that can be stopped during shutdown
 */
export function scheduleAccountDeletionJob() {
    // Schedule job to run every day at midnight
    const scheduledTask = cron.schedule( '0 0 * * *', () => {
        processAccountDeletions().catch( err => {
            console.error( 'Error in scheduled account deletion job:', err );
        } );
    } );

    console.info( 'Account deletion job scheduled to run daily at midnight' );

    // Run the job immediately once on startup to process any pending deletions
    processAccountDeletions().catch( err => {
        console.error( 'Error in initial account deletion job run:', err );
    } );

    return scheduledTask;
}
