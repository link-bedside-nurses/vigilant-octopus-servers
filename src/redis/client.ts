import logger from '@/utils/logger'
import { createClient } from 'redis'

export default async function createRedisClient() {
	const client = await createClient( {
		url: "rediss://red-clslqllcm5oc73b83ab0:fn9P7Eh0YwT46AXwguo5YbA7e8rypTcS@frankfurt-redis.render.com:6379"
	} )
		.on( 'error', err => {
			logger.info( err ), process.exit( 1 )
		} )
		.on( 'connect', () => logger.info( 'Initialised redis connection' ) )
		.on( 'end', () => logger.info( 'Connection to redis has been closed' ) )
		.on( 'reconnecting', () => logger.info( 'Connected to redis' ) )
		.connect()

	return client
}
