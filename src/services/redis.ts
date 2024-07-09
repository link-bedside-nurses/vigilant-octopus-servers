import Redis from 'ioredis';
import logger from '../utils/logger';

const redis = new Redis({
	host: 'localhost',
	port: 6379,
	password: '',
});

redis.on('error', (err) => {
	console.error('Redis Client Error', err);
});

redis.once('connect', () => logger.info('Connected to redis'));

export default redis;
