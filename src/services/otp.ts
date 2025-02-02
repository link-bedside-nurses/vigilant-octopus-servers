import redis from './redis';
import * as crypto from 'crypto';

export function generateOTP() {
	const buffer = crypto.randomBytes( 3 );
	const otp = parseInt( buffer.toString( 'hex' ), 16 ).toString().slice( 0, 6 );
	console.log( 'otp', otp );
	return otp;
}

export async function storeOTP( key: string, otp: string ): Promise<void> {
	console.log( 'storing otp in redis for key', key, 'with value', otp );
	await redis.set( key, otp, 'EX', 120 );
}

export async function getOTP( key: string ): Promise<string | null> {
	console.log( 'getting otp from redis for key', key );
	const otp = await redis.get( key );
	console.log( 'otp from redis', otp );
	return otp;
}

export async function expireOTP( key: string ): Promise<void> {
	console.log( 'deleting key from redis for key', key );
	await redis.del( key );
}
