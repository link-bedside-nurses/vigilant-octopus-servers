import logger from '@/utils/logger'
import { createClient } from 'redis'

export default async function CreateRedisClient() {
	const client = await createClient()
		.on('error', err =>
			logger.info(
				'An error has occurred during a redis connection —usually a network issue such as "Socket closed unexpectedly"',
				err,
			),
		)
		.on('connect', () => logger.info('Initiating a connection to the redis'))
		.on('end', () => logger.info('Connection to redis has been closed'))
		.on('reconnecting', () => logger.info('Connected to redis'))
		.connect()

	return client
}
