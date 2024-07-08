import { getOTP } from '../services/otp';

export default async function verifyEmailOTP(email: string, suppliedOTP: string): Promise<boolean> {
	const storedOTP = await getOTP(email);

	if (!storedOTP) {
		return false;
	}

	return storedOTP === suppliedOTP;
}
