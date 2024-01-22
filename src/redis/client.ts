import { EnvironmentVars } from '@/constants'
import { __PROD__ } from '@/constants/prod'
import logger from '@/utils/logger'
import { createClient } from 'redis'

export default function createRedisClient() {
	const client = __PROD__ ? createClient( { url: EnvironmentVars.getRedisURL() } ) : createClient()

	client.on( 'error', err => {
		logger.info( err ), process.exit( 1 )
	} )
		.on( 'connect', () => logger.info( 'Initialised redis connection' ) )
		.on( 'end', () => logger.info( 'Connection to redis has been closed' ) )
		.on( 'reconnecting', () => logger.info( 'Connected to redis' ) )
		.connect()

	return client
}
