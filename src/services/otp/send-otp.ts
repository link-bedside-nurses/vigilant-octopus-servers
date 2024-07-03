import * as crypto from 'crypto';
import axios from 'axios';
import { otpCacheStore } from '../../cache-store/client';

export default async function sendOTP(phone: string, otp: string) {
	const response = await axios.post(
		'https://e1wzeq.api.infobip.com//sms/2/text/advanced',
		{
			messages: [
				{
					destinations: [{ to: phone }],
					from: 'ServiceSMS',
					text: 'LINKBEDSIDES::Your OTP is ' + otp,
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

export function generateOTP() {
	const buffer = crypto.randomBytes(3);
	const otp = Number(parseInt(buffer.toString('hex'), 16).toString().slice(0, 6));
	return otp;
}

export async function storeOTP(phone: string, otp: string): Promise<void> {
	otpCacheStore.set(phone, otp);
}

export async function getOTPFromCacheStore(phone: string): Promise<string | undefined> {
	return otpCacheStore.get(phone);
}
