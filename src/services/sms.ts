import axios from 'axios';

export default async function sendOTP(phone: string, otp: string) {
	const response = await axios.post(
		'https://e1wzeq.api.infobip.com/sms/2/text/advanced',
		{
			messages: [
				{
					destinations: [{ to: phone }],
					from: 'ServiceSMS',
					text: `LINKBEDSIDES::Your OTP is ${otp}`,
				},
			],
		},
		{
			headers: {
				Authorization: `App 9fc830f221c28b354b493a57a4ff3f9e-a47fd25f-efa5-42e1-ac24-b8800accd9ca`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			maxRedirects: 20,
		}
	);

	return response;
}
