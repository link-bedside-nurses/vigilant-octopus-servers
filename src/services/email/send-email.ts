import { sendMail } from './email';
// import EnvVars from "../../constants/env-vars"

export default async function sendOTPToEmal( email: string, otp: string ) {

	const res = await sendMail(
		email,
		"",
		"su",
		otp
	)

	return res
}
