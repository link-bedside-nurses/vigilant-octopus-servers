import mongoose from 'mongoose';

import logger from '../../core/utils/logger';

import { envars } from '../../config/constants';

const DATABASE_CONNECTION_URI = envars.DATABASE_URL;
const DATABASE_NAME = envars.DATABASE_NAME;

export async function connectToDatabase() {
	try {
		const connection = await mongoose.connect( DATABASE_CONNECTION_URI, {
			dbName: DATABASE_NAME,
		} );

		console.info( `Connected: ${connection.connection.db.databaseName}` );

		// Seed database after successful connection
		if ( process.env.NODE_ENV === 'development' ) {
			// await seedDatabase();
		}
	} catch ( error ) {
		console.error( error );
		process.exit( 1 );
	}
}

export async function disconnectFromDatabase() {
	try {
		if ( mongoose.connection.id ) {
			await mongoose.connection.close();
			logger.info( 'disconnecting from db' );
		}
		return;
	} catch ( error ) {
		logger.error( error, 'Error disconnecting db' );
	}
}
