import mongoose from 'mongoose'

import logger from '../utils/logger'
import { EnvironmentVars } from '../constants'

const DATABASE_CONNECTION_URI = EnvironmentVars.getDatabaseUrl()
const DATABASE_NAME = EnvironmentVars.getDatabaseName()

export async function connectToDatabase() {
	try {
		const connection = await mongoose.connect(DATABASE_CONNECTION_URI, {
			dbName: DATABASE_NAME,
		})
		logger.info(`Connected: ${connection.connection.db.databaseName}`)
	} catch (error) {
		logger.error(error)
		process.exit(1)
	}
}

export async function disconnectFromDatabase() {
	try {
		if (mongoose.connection.id) {
			await mongoose.connection.close()
			logger.info('disconnecting from db')
		}
		return
	} catch (error) {
		logger.error(error, 'Error disconnecting db')
	}
}
