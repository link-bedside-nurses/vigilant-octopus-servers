import { html } from '../../config/constants/html';
import { sendMail } from '../../infra/external-services/email/email';
import { generateOTP, storeOTP } from '../../services/otp';

export default async function startEmailVerification(email: string) {
	const otp = generateOTP();
	await storeOTP(email, otp);
	await sendMail(email, html(otp), 'Email Verification', otp);
}
