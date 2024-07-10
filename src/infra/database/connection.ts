import mongoose from 'mongoose';

import logger from '../../core/utils/logger';
import {
	seedCaregivers,
	seedPatients,
	seedAdmins,
	seedPayments,
	seedAppointments,
	seedRatings,
} from './seed';
import { EnvironmentVars } from '../../config/constants';

const DATABASE_CONNECTION_URI = EnvironmentVars.getDatabaseUrl();
const DATABASE_NAME = EnvironmentVars.getDatabaseName();

export async function connectToDatabase() {
	try {
		const connection = await mongoose.connect(DATABASE_CONNECTION_URI, {
			dbName: DATABASE_NAME,
		});

		logger.info(`Connected: ${connection.connection.db.databaseName}`);
	} catch (error) {
		logger.error(error);
		process.exit(1);
	}
}

export async function disconnectFromDatabase() {
	try {
		if (mongoose.connection.id) {
			await mongoose.connection.close();
			logger.info('disconnecting from db');
		}
		return;
	} catch (error) {
		logger.error(error, 'Error disconnecting db');
	}
}

export async function seedDatabase() {
	try {
		logger.info('Seeding patients...');
		await seedPatients();
		logger.info('Patients seeded.');

		logger.info('Seeding caregivers...');
		await seedCaregivers();
		logger.info('Caregivers seeded.');

		logger.info('Seeding admins...');
		await seedAdmins();
		logger.info('Admins seeded.');

		logger.info('Seeding appointments...');
		await seedAppointments();
		logger.info('Appointments seeded.');

		logger.info('Seeding payments...');
		await seedPayments();
		logger.info('Payments seeded.');

		logger.info('Seeding ratings...');
		await seedRatings();
		logger.info('Ratings seeded.');

		logger.info('Database seeding completed successfully.');
	} catch (error) {
		logger.error('Error seeding database:', error);
	}
}

// seedDatabase();
