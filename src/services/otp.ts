import redis from './redis';
import cron from 'node-cron';

export async function storeOTP(key: string, otp: string): Promise<void> {
	await redis.set(key, otp, 'EX', 120);
}

export async function getOTP(key: string): Promise<string | null> {
	return await redis.get(key);
}

export async function expireOTP(key: string): Promise<void> {
	await redis.del(key);
}

cron.schedule('*/2 * * * *', async () => {
	console.log('Running scheduled task.');
});

import * as crypto from 'crypto';

export function generateOTP() {
	const buffer = crypto.randomBytes(3);
	const otp = parseInt(buffer.toString('hex'), 16).toString().slice(0, 6);
	return otp;
}
