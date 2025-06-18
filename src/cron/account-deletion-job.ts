import cron from 'node-cron';
import { accountDeletionService } from '../services/account-deletion';
import logger from '../utils/logger';

/**
 * Schedule the account deletion job to run daily at midnight
 * Returns the scheduled task that can be stopped during shutdown
 */
export function scheduleAccountDeletionJob() {
	// Schedule job to run every day at midnight
	const scheduledTask = cron.schedule('0 0 * * *', () => {
		accountDeletionService.processAccountDeletions().catch((err) => {
			logger.error('Error in scheduled account deletion job:', err);
		});
	});

	logger.info('Account deletion job scheduled to run daily at midnight');

	// Run the job immediately once on startup to process any pending deletions
	accountDeletionService.processAccountDeletions().catch((err) => {
		logger.error('Error in initial account deletion job run:', err);
	});

	return scheduledTask;
}
