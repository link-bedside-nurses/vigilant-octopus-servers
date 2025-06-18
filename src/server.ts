import 'dotenv/config';
import 'reflect-metadata';
import { replaceTscAliasPaths } from 'tsc-alias';

import express from 'express';
import 'express-async-errors';
import envars from './config/env-vars';
import { scheduleAccountDeletionJob } from './cron/account-deletion-job';
import { connectToDatabase, disconnectFromDatabase, healthCheck } from './database';
import router from './router';
import logger from './utils/logger';

replaceTscAliasPaths().catch((err: Error) => logger.info(err.message));

const app = express();

app.use(express.static('public'));

app.set('trust proxy', false);

app.use(router);

// Enhanced error handling
process.on('unhandledRejection', (reason, promise) => {
	const serializedPromise = JSON.stringify(promise);
	const serializedReason = reason instanceof Error ? reason.stack : reason;

	logger.error('Unhandled Rejection:', {
		promise: serializedPromise,
		reason: serializedReason,
	});
});

process.on('uncaughtException', (exception) => {
	logger.error('Uncaught Exception:', exception);
	// Give time for logs to be written before exit
	setTimeout(() => process.exit(1), 1000);
});

// Define cronJob variable in wider scope for access in shutdown
let accountDeletionCronJob: any = null;

const server = app.listen(envars.PORT, async () => {
	console.clear();
	logger.info(`🚀 Server starting on port ${envars.PORT}`);

	try {
		// Connect to database
		await connectToDatabase();

		// Schedule the account deletion cron job after database connection is established
		accountDeletionCronJob = scheduleAccountDeletionJob();
		logger.info('✅ Account deletion cron job scheduled successfully');

		logger.info(`✅ Server ready at http://127.0.0.1:${envars.PORT}`);
	} catch (error) {
		logger.error('❌ Failed to start server:', error);
		process.exit(1);
	}
});

// Enhanced graceful shutdown
const shutdownSignals = ['SIGTERM', 'SIGINT'];

for (let counter = 0; counter < shutdownSignals.length; counter++) {
	gracefulShutdown(shutdownSignals[counter]);
}

function gracefulShutdown(signal: string) {
	process.on(signal, async () => {
		logger.info(`🛑 Received ${signal}. Starting graceful shutdown...`);

		try {
			// Stop the cron job if it exists
			if (accountDeletionCronJob) {
				accountDeletionCronJob.stop();
				logger.info('✅ Account deletion cron job stopped');
			}

			// Disconnect from database
			await disconnectFromDatabase();

			// Close server
			server.close((error) => {
				if (error) {
					logger.error('❌ Failed to close server:', error);
					process.exit(1);
				} else {
					logger.info('✅ Server closed successfully');
					process.exit(0);
				}
			});

			// Force exit after 10 seconds if graceful shutdown fails
			setTimeout(() => {
				logger.error('❌ Forced shutdown after timeout');
				process.exit(1);
			}, 10000);
		} catch (error) {
			logger.error('❌ Error during graceful shutdown:', error);
			process.exit(1);
		}
	});
}

// Health check endpoint (optional - you can add this to your router)
app.get('/health', async (_req, res) => {
	try {
		const dbHealth = await healthCheck();
		const serverHealth = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			database: dbHealth,
		};

		res.status(dbHealth.status === 'healthy' ? 200 : 503).json(serverHealth);
	} catch (error) {
		res.status(503).json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
});

export { server as app };
