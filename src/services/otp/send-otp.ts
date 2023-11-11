import * as crypto from 'crypto'
import { EnvironmentVars } from '@/constants'

import twilio from 'twilio'

import redisClient from '@/redis/store'

const client = twilio(EnvironmentVars.getTwilioAccountSID(), EnvironmentVars.getTwilioAuthToken())

export default async function sendOTP(phone: string, otp: string) {
	const message = await client.messages.create({
		to: phone,
		from: EnvironmentVars.getFromSMSPhone(),
		body: `Your OTP is: ${otp}`,
	})

	return message
}

export function generateOTP() {
	const buffer = crypto.randomBytes(3)

	const numericOTP = Number(parseInt(buffer.toString('hex'), 16).toString().slice(0, 6))

	return numericOTP
}

export async function storeOTP(phoneNumber: string, otp: string): Promise<void> {
	const client = await redisClient()
	await client.set(phoneNumber, otp)
	const TWO_MINUTES = 2 * 60
	await client.expire(phoneNumber, TWO_MINUTES)
}

export async function getOTPFromRedis(phoneNumber: string): Promise<string | null> {
	const client = await redisClient()
	const otp = await client.get(phoneNumber)
	await client.disconnect()
	return otp
}
