import 'reflect-metadata'
import { replaceTscAliasPaths } from 'tsc-alias'
import 'dotenv/config'

import express from 'express'

import logger from '@/utils/logger'
import { EnvironmentVars } from '@/constants'
import { connectToDatabase, disconnectFromDatabase } from '@/db/connection'
import createRedisClient from '@/redis/client'
import ROUTER from '@/router/router'

replaceTscAliasPaths().catch( ( err: Error ) => logger.error( err.message ) )

const app = express()

app.set( "trust proxy", false )
app.use( ROUTER )

process.on( 'unhandledRejection', ( reason, promise ) => {
	logger.error( 'Unhandled Rejection at:', {
		promise,
		reason,
	} )
} )

process.on( 'uncaughtException', exception => {
	logger.error( 'Uncaught Exception', exception )
} )

const server = app.listen( EnvironmentVars.getPort(), async () => {
	logger.info( `Listening at ${'127.0.0.1:'}${EnvironmentVars.getPort()}` )

	await connectToDatabase()

	createRedisClient()
} )
const shutdownSignals = ['SIGTERM', 'SIGINT']

for ( let counter = 0; counter < shutdownSignals.length; counter++ ) {
	gracefulShutdown( shutdownSignals[counter] )
}

function gracefulShutdown( signal: string ) {
	process.on( signal, async () => {
		await disconnectFromDatabase()

		await ( createRedisClient() ).disconnect()
		server.close( error => {
			logger.error( error, 'Failed to close server. Server was not open!' )
		} )

		process.exit( 0 )
	} )
}

export { server as app }
