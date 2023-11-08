import { EnvironmentVars } from '@/constants'
import { logger } from '@typegoose/typegoose/lib/logSettings'

import twilio from 'twilio'

const client = twilio(EnvironmentVars.getTwilioAccountSID(), EnvironmentVars.getTwilioAuthToken())
export default function sendOTP(phone: string, otp: number) {
	client.messages
		.create({
			to: phone,
			from: EnvironmentVars.getFromSMSPhone(),
			body: `Your OTP is: ${otp}`,
		})
		.then(message => logger.info(message.sid))
}

export function generateOTP() {
	return Math.floor(1000 + Math.random() * 9000).toString()
}
