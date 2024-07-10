import axios from 'axios';
import envVars from '../../../config/constants/env-vars';

export default async function sendOTP(phone: string, otp: string) {
	const response = await axios.post(
		'https://e1wzeq.api.infobip.com/sms/2/text/advanced',
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
				Authorization: `App ${envVars.getInfobipSecretKey()}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			maxRedirects: 20,
		}
	);

	return response;
}
