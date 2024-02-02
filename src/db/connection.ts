import mongoose from 'mongoose'

import logger from '../utils/logger'
import { EnvironmentVars } from '../constants'
import { seedCaregivers, seedPatients, seedAdmins, seedPayments, seedAppointments, seedRatings } from '@/db/seed'


const DATABASE_CONNECTION_URI = EnvironmentVars.getDatabaseUrl()
const DATABASE_NAME = EnvironmentVars.getDatabaseName()

export async function connectToDatabase() {
	try {
		const connection = await mongoose.connect( DATABASE_CONNECTION_URI, {
			dbName: DATABASE_NAME,
		} )
		logger.info( `Connected: ${connection.connection.db.databaseName}` )
	} catch ( error ) {
		logger.error( error )
		process.exit( 1 )
	}
}

export async function disconnectFromDatabase() {
	try {
		if ( mongoose.connection.id ) {
			await mongoose.connection.close()
			logger.info( 'disconnecting from db' )
		}
		return
	} catch ( error ) {
		logger.error( error, 'Error disconnecting db' )
	}
}

async function seedDatabase() {
	try {
		await seedCaregivers()
		await seedPatients()
		await seedAdmins()
		await seedAppointments()
		await seedRatings()
		await seedPayments()

		console.log( 'Seed data inserted successfully!' );
	} catch ( error ) {
		console.error( 'Error seeding database:', error );
	}
}


// seedDatabase();
