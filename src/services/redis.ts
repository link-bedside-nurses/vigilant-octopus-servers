import Redis from 'ioredis';

const redis = new Redis( {
	host: 'localhost',
	port: 6379,
	password: '',
} );

redis.on( 'error', ( err ) => console.error( 'Redis Client Error', err ) );

redis.once( 'connect', () => console.info( 'Connected to redis' ) );

export default redis;
