import * as crypto from 'crypto'
import { EnvironmentVars } from '@/constants'

import twilio from 'twilio'

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
