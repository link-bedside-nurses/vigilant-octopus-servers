import cron from 'node-cron';
import { db } from '../database';
import { NurseRepo } from '../database/repositories/nurse-repository';
import { PatientRepo } from '../database/repositories/patient-repository';

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

        // Find nurses marked for deletion older than 7 days
        const nursesToDelete = await db.nurses.find( {
            markedForDeletion: true,
            deletionRequestDate: { $lte: cutoffDate }
        } );

        console.log( "nursesToDelete", nursesToDelete )


        // Find patients marked for deletion older than 7 days
        const patientsToDelete = await db.patients.find( {
            markedForDeletion: true,
            deletionRequestDate: { $lte: cutoffDate }
        } );

        console.log( "patientsToDelete", patientsToDelete )
        // Log the number of accounts to be deleted
        console.info( `Found ${nursesToDelete.length} nurses and ${patientsToDelete.length} patients to delete` );

        // Delete each nurse
        for ( const nurse of nursesToDelete ) {
            console.info( `Deleting nurse: ${nurse._id}` );
            await NurseRepo.deleteNurse( nurse._id.toString() );
        }

        // Delete each patient
        for ( const patient of patientsToDelete ) {
            console.info( `Deleting patient: ${patient._id}` );
            await PatientRepo.deletePatient( patient._id.toString() );
        }

        console.info( `Successfully deleted ${nursesToDelete.length} nurses and ${patientsToDelete.length} patients` );
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
