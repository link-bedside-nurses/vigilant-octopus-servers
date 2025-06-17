import { html } from '../config/html';
import { sendMail } from '../services/email';
import { generateOTP, storeOTP } from '../services/otp';

export default async function startEmailVerification( email: string ) {
	const otp = generateOTP();
	await storeOTP( email, otp );
	await sendMail( email, html( otp ), 'Email Verification', otp );
}
