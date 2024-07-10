import { generateOTP, storeOTP } from '../../services/otp';
import sendOTP from '../../infrastructure/external-services/sms/sms';

export default async function startPhoneVerification(phone: string) {
	const otp = generateOTP();
	await storeOTP(phone, otp);
	await sendOTP(phone, otp);
}
