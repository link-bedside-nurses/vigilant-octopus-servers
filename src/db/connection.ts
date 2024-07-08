import mongoose from 'mongoose';

import logger from '../utils/logger';
import { EnvironmentVars } from '../constants';
import {
	seedCaregivers,
	seedPatients,
	seedAdmins,
	seedPayments,
	seedAppointments,
	seedRatings,
} from '../db/seed';

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
		console.log('Seeding patients...');
		await seedPatients();
		console.log('Patients seeded.');

		console.log('Seeding caregivers...');
		await seedCaregivers();
		console.log('Caregivers seeded.');

		console.log('Seeding admins...');
		await seedAdmins();
		console.log('Admins seeded.');

		console.log('Seeding appointments...');
		await seedAppointments();
		console.log('Appointments seeded.');

		console.log('Seeding payments...');
		await seedPayments();
		console.log('Payments seeded.');

		console.log('Seeding ratings...');
		await seedRatings();
		console.log('Ratings seeded.');

		console.log('Database seeding completed successfully.');
	} catch (error) {
		console.error('Error seeding database:', error);
	}
}

// seedDatabase();
