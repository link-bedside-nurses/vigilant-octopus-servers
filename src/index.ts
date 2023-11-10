import 'reflect-metadata'
import { replaceTscAliasPaths } from 'tsc-alias'
import { rateLimit } from 'express-rate-limit'
import 'dotenv/config'

import cors from 'cors'
import compression from 'compression'
import helmet from 'helmet'
import express from 'express'
import morgan from 'morgan'
import cluster from 'cluster'
import { StatusCodes } from 'http-status-codes'

import logger from '@/utils/logger'
import { EnvironmentVars } from '@/constants'
import { connectToDatabase, disconnectFromDatabase } from '@/db/connection'
import errorMiddleware from '@/middlewares/error-middleware'
import { sessionRouter } from '@/modules/sessions/routes'
import { profileRouter } from '@/modules/profile/routes'
import { ratingsRouter } from '@/modules/ratings/routes'
import { testRouter } from '@/modules/test/routes'
import { authRouter } from '@/modules/auth/routes'
import { patientRouter } from '@/modules/patients/routes'
import { caregiverRouter } from '@/modules/caregivers/routes'
import { meRouter } from '@/modules/me/routes'
import { paymentsRouter } from '@/modules/payments/routes'
import { adminRouter } from '@/modules/admins/routes'
import os from 'os'
import { IncomingMessage, Server, ServerResponse } from 'node:http'

replaceTscAliasPaths().catch((err: Error) => logger.error(err.message))

let server: Server<typeof IncomingMessage, typeof ServerResponse>
if (cluster.isPrimary) {
	for (let i = 0; i < os.cpus().length; i++) {
		cluster.fork()
	}

	cluster.on('exit', worker => {
		logger.error(`Worker ${worker.process.pid} died`)
	})
} else {
	const app = express()

	app.use(cors())
	app.use(compression())
	app.use(morgan('short'))
	app.use(helmet())
	app.use(express.json())
	app.use(express.urlencoded({ extended: true }))

	if (EnvironmentVars.getNodeEnv() === 'development') {
		app.use(morgan('combined', { immediate: true }))
	}

	const ONE_MINUTE = 60 * 1000
	app.use(
		rateLimit({
			windowMs: ONE_MINUTE,
			limit: EnvironmentVars.getNodeEnv() === 'production' ? 10 : Number.MAX_SAFE_INTEGER,
		}),
	)

	app.use('/status', function (request: express.Request, response: express.Response) {
		return response.status(StatusCodes.OK).send({ error: 'Server is online!', requestHeaders: request.headers })
	})

	app.use('/', testRouter)
	app.use('/auth', authRouter)
	app.use('/sessions', sessionRouter)
	app.use('/profile', profileRouter)
	app.use('/ratings', ratingsRouter)
	app.use('/patients', patientRouter)
	app.use('/caregivers', caregiverRouter)
	app.use('/admins', adminRouter)
	app.use('/payments', paymentsRouter)
	app.use('/me', meRouter)

	app.use(errorMiddleware)

	process.on('unhandledRejection', (reason, promise) => {
		logger.error('Unhandled Rejection at:', { promise: promise, reason: reason })
	})

	process.on('uncaughtException', exception => {
		logger.error('Uncaught Exception', exception)
	})

	server = app.listen(EnvironmentVars.getPort(), async () => {
		logger.info(`${'127.0.0.1:'}${EnvironmentVars.getPort()}`)

		await connectToDatabase()
	})
	const shutdownSignals = ['SIGTERM', 'SIGINT']

	for (let counter = 0; counter < shutdownSignals.length; counter++) {
		gracefulShutdown(shutdownSignals[counter])
	}
}

function gracefulShutdown(signal: string) {
	process.on(signal, async () => {
		await disconnectFromDatabase()

		server.close(error => {
			logger.error(error, 'Failed to close server. Server was not open!')
		})

		process.exit(0)
	})
}
