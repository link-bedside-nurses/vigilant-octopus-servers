import * as crypto from 'crypto'
import { EnvironmentVars } from '@/constants'

import twilio from 'twilio'

import redis from '@/redis/client'

const client = twilio( EnvironmentVars.getTwilioAccountSID(), EnvironmentVars.getTwilioAuthToken() )

export default async function sendOTP( phone: string, otp: string ) {
	const message = await client.messages.create( {
		to: phone,
		from: EnvironmentVars.getFromSMSPhone(),
		body: `Your OTP is: ${otp}`,
	} )

	return message
}

export function generateOTP() {
	const buffer = crypto.randomBytes( 3 )

	const otp = Number( parseInt( buffer.toString( 'hex' ), 16 ).toString().slice( 0, 6 ) )

	return otp
}

export async function storeOTP( phone: string, otp: string ): Promise<void> {
	const client = await redis()
	await client.set( phone, otp )
	const TWO_MINUTES = 2 * 60
	await client.expire( phone, TWO_MINUTES )
}

export async function getOTPFromRedis( phone: string ): Promise<string | null> {
	const client = await redis()
	const otp = await client.get( phone )
	return otp
}
