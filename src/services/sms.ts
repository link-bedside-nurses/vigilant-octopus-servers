import axios from 'axios';
import envVars from '../config/env-vars';

export default async function sendOTP( phone: string, otp: string ) {
	console.log( envVars.INFOBIP_URL );
	const response = await axios.post(
		envVars.INFOBIP_URL,
		{
			messages: [
				{
					destinations: [{ to: phone }],
					from: 'ServiceSMS',
					text: `Your verication code is ${otp}`,
				},
			],
		},
		{
			headers: {
				Authorization: `App ${envVars.INFOBIP_SECRET_KEY}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			maxRedirects: 20,
		}
	);

	return response;
}
