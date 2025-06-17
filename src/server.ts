import 'reflect-metadata';
import { replaceTscAliasPaths } from 'tsc-alias';
import 'dotenv/config';

import express from 'express';
import 'express-async-errors';
import { connectToDatabase, disconnectFromDatabase } from './database/connection';
import router from './router';
import { envars } from './config';
import { scheduleAccountDeletionJob } from './cron/account-deletion-job';

replaceTscAliasPaths().catch( ( err: Error ) => console.info( err.message ) );

const app = express();

app.use( express.static( 'public' ) );

app.set( 'trust proxy', false );

app.use( router );

process.on( 'unhandledRejection', ( reason, promise ) => {
	const serializedPromise = JSON.stringify( promise );
	const serializedReason = reason instanceof Error ? reason.stack : reason;

	console.error( 'Unhandled Rejection:', {
		promise: serializedPromise,
		reason: serializedReason,
	} );
} );

process.on( 'uncaughtException', ( exception ) => {
	console.log( 'expection', exception );
	console.error( 'Uncaught Exception', exception );
} );

// Define cronJob variable in wider scope for access in shutdown
let accountDeletionCronJob: any = null;

const server = app.listen( envars.PORT, async () => {
	console.clear();
	console.info( `Listening at ${'127.0.0.1:'}${envars.PORT}` );

	await connectToDatabase();

	// Schedule the account deletion cron job after database connection is established
	accountDeletionCronJob = scheduleAccountDeletionJob();
	console.info( 'Account deletion cron job scheduled successfully' );
} );

const shutdownSignals = ['SIGTERM', 'SIGINT'];

for ( let counter = 0; counter < shutdownSignals.length; counter++ ) {
	gracefulShutdown( shutdownSignals[counter] );
}

function gracefulShutdown( signal: string ) {
	process.on( signal, async () => {
		console.info( `Received ${signal}. Starting graceful shutdown...` );

		// Stop the cron job if it exists
		if ( accountDeletionCronJob ) {
			accountDeletionCronJob.stop();
			console.info( 'Account deletion cron job stopped' );
		}

		await disconnectFromDatabase();

		server.close( ( error ) => {
			if ( error ) {
				console.error( error, 'Failed to close server. Server was not open!' );
			} else {
				console.info( 'Server closed successfully' );
			}
		} );

		process.exit( 0 );
	} );
}

export { server as app };
