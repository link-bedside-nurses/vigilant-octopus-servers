import 'reflect-metadata';
import { replaceTscAliasPaths } from 'tsc-alias';
import 'dotenv/config';

import express from 'express';
import 'express-async-errors';
import { connectToDatabase, disconnectFromDatabase } from './infra/database/connection';
import router from './router';
import logger from './core/utils/logger';
import { envars } from './config/constants';

replaceTscAliasPaths().catch((err: Error) => logger.info(err.message));

const app = express();

app.set('trust proxy', false);
app.use(router);

process.on('unhandledRejection', (reason, promise) => {
	const serializedPromise = JSON.stringify(promise);
	const serializedReason = reason instanceof Error ? reason.stack : reason;

	logger.error('Unhandled Rejection:', {
		promise: serializedPromise,
		reason: serializedReason,
	});
});
process.on('uncaughtException', (exception) => {
	logger.error('Uncaught Exception', exception);
});

const server = app.listen(envars.PORT, async () => {
	console.clear();
	logger.info(`Listening at ${'127.0.0.1:'}${envars.PORT}`);

	await connectToDatabase();
});
const shutdownSignals = ['SIGTERM', 'SIGINT'];

for (let counter = 0; counter < shutdownSignals.length; counter++) {
	gracefulShutdown(shutdownSignals[counter]);
}

function gracefulShutdown(signal: string) {
	process.on(signal, async () => {
		await disconnectFromDatabase();

		server.close((error) => {
			logger.error(error, 'Failed to close server. Server was not open!');
		});

		process.exit(0);
	});
}

export { server as app };
