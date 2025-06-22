import { getModelForClass } from '@typegoose/typegoose';
import mongoose from 'mongoose';
import logger from '../utils/logger';

import envars from '../config/env-vars';
import { Admin } from './models/Admin';
import { Appointment } from './models/Appointment';
import { Nurse } from './models/Nurse';
import { Patient } from './models/Patient';
import { Payment } from './models/Payment';
import { seedDatabase } from './seed';

export const db = Object.freeze({
	appointments: getModelForClass(Appointment),
	nurses: getModelForClass(Nurse),
	patients: getModelForClass(Patient),
	admins: getModelForClass(Admin),
	payments: getModelForClass(Payment),
});

export type DatabaseType = typeof db;

// Connection options
const connectionOptions = {
	dbName: envars.DATABASE_NAME,
	maxPoolSize: 10, // Maintain up to 10 socket connections
	serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

// Connection state
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

/**
 * Connect to MongoDB database
 */
export async function connectToDatabase(): Promise<void> {
	try {
		if (isConnected && mongoose.connection.readyState === 1) {
			logger.info('Database already connected');
			return;
		}

		logger.info('Connecting to database...');

		const dbUrl = envars.DATABASE_URL;

		const connection = await mongoose.connect(dbUrl, connectionOptions);

		isConnected = true;
		connectionRetries = 0;

		logger.info(`✅ Connected to database: ${connection.connection.db.databaseName}`);

		setupConnectionListeners();

		if (process.env.NODE_ENV === 'development' && process.env.SEED_DATABASE) {
			try {
				logger.info('🌱 Starting database seeding...');
				await seedDatabase();
				logger.info('✅ Database seeding completed');
			} catch (error) {
				logger.error('❌ Database seeding failed:' + error);
			}
		}
	} catch (error) {
		connectionRetries++;
		logger.error(
			`❌ Database connection failed (attempt ${connectionRetries}/${MAX_RETRIES}): ${error}`
		);

		if (connectionRetries < MAX_RETRIES) {
			logger.info(`🔄 Retrying connection in 5 seconds...`);
			setTimeout(() => connectToDatabase(), 5000);
		} else {
			logger.error('❌ Max connection retries reached. Exiting...');
			process.exit(1);
		}
	}
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectFromDatabase(): Promise<void> {
	try {
		if (mongoose.connection.readyState !== 0) {
			await mongoose.connection.close();
			isConnected = false;
			logger.info('✅ Disconnected from database');
		}
	} catch (error) {
		logger.error('❌ Error disconnecting from database:', error);
		throw error;
	}
}

/**
 * Setup database connection event listeners
 */
function setupConnectionListeners(): void {
	mongoose.connection.on('connected', () => {
		logger.info('✅ MongoDB connected');
	});

	mongoose.connection.on('error', (error) => {
		logger.error('❌ MongoDB connection error:', error);
		isConnected = false;
	});

	mongoose.connection.on('disconnected', () => {
		logger.warn('⚠️ MongoDB disconnected');
		isConnected = false;
	});

	mongoose.connection.on('reconnected', () => {
		logger.info('🔄 MongoDB reconnected');
		isConnected = true;
	});

	// Graceful shutdown
	process.on('SIGINT', async () => {
		logger.info('🛑 Received SIGINT. Closing database connection...');
		await disconnectFromDatabase();
		process.exit(0);
	});

	process.on('SIGTERM', async () => {
		logger.info('🛑 Received SIGTERM. Closing database connection...');
		await disconnectFromDatabase();
		process.exit(0);
	});
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
	return isConnected && mongoose.connection.readyState === 1;
}

/**
 * Get database connection status
 */
export function getDatabaseStatus(): {
	isConnected: boolean;
	readyState: number;
	host: string;
	name: string;
} {
	return {
		isConnected: isDatabaseConnected(),
		readyState: mongoose.connection.readyState,
		host: mongoose.connection.host || 'unknown',
		name: mongoose.connection.name || 'unknown',
	};
}

/**
 * Health check for database
 */
export async function healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
	try {
		if (!isDatabaseConnected()) {
			return {
				status: 'unhealthy',
				details: { error: 'Database not connected' },
			};
		}

		// Ping the database
		await mongoose.connection.db.admin().ping();

		return {
			status: 'healthy',
			details: getDatabaseStatus(),
		};
	} catch (error) {
		return {
			status: 'unhealthy',
			details: { error: error instanceof Error ? error.message : 'Unknown error' },
		};
	}
}
