import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { DESIGNATION } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { generateOTP, storeOTP } from '../../services/otp';
import sendOTP from '../../infra/external-services/sms/sms';
import { PhoneVerifcationOTPDto, PhoneVerifcationOTPSchema } from '../../core/interfaces/dtos';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import logger from '../../core/utils/logger';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';

export function getPhoneVerificationOTP() {
	return async function (request: HTTPRequest<object, object, PhoneVerifcationOTPDto>) {
		const result = PhoneVerifcationOTPSchema.safeParse(request.query);
		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`
			);
		}
		if (
			![DESIGNATION.CAREGIVER, DESIGNATION.PATIENT].includes(result.data.designation as DESIGNATION)
		) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'Only patients or caregivers can access this route'
			);
		}

		let user;
		if (result.data.designation === DESIGNATION.CAREGIVER) {
			user = await CaregiverRepo.getCaregiverByPhone(result.data.toPhone);
		} else if (result.data.designation === DESIGNATION.PATIENT) {
			user = await PatientRepo.getPatientByPhone(result.data.toPhone);
		}

		if (!user) {
			return response(StatusCodes.NOT_FOUND, null, 'User not found');
		}

		const otp = generateOTP();

		await storeOTP(result.data.toPhone, otp);

		logger.info(`OTP Expiring for phone: ${result.data.toPhone} in  2 minutes from now`);

		const otpResponse = await sendOTP(result.data.toPhone, otp);

		return response(
			StatusCodes.OK,
			JSON.parse(otpResponse.config.data),
			'OTP generated successfully!'
		);
	};
}
