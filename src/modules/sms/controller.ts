import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { Document } from 'mongoose';
import { DESIGNATION, ACCOUNT } from '../../interfaces';
import { response } from '../../utils/http-response';
import { generateOTP, getOTP, storeOTP } from '../../services/otp';
import sendOTP from '../../services/sms';
import {
	PhoneVerifcationOTPDto,
	PhoneVerifcationOTPSchema,
	VerifyPhoneDto,
	VerifyPhoneSchema,
} from '../../interfaces/dtos';
import { CaregiverRepo } from '../users/caregivers/repository';
import { PatientRepo } from '../users/patients/repository';
import logger from '../../utils/logger';

export function getPhoneVericationOTP() {
	return async function (request: HTTPRequest<object, object, PhoneVerifcationOTPDto>) {
		const result = PhoneVerifcationOTPSchema.safeParse(request.query);
		if (!result.success) {
			return response(
				StatusCodes.BAD_REQUEST,
				result.error.issues,
				JSON.parse(result.error.message)[0].message
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
			if (!user) {
				return response(StatusCodes.NOT_FOUND, null, 'User not found');
			}
		}
		if (result.data.designation === DESIGNATION.PATIENT) {
			user = await PatientRepo.getPatientByPhone(result.data.toPhone);
			if (!user) {
				return response(StatusCodes.NOT_FOUND, null, 'User not found');
			}
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

export function verifyOTPFromPhone() {
	return async function (request: HTTPRequest<object, object, VerifyPhoneDto>) {
		const result = VerifyPhoneSchema.safeParse(request.query);
		if (!result.success) {
			return response(StatusCodes.OK, result.error.issues, 'Validation Error');
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
			user = await CaregiverRepo.getCaregiverByPhone(result.data.phone);
			if (!user) {
				return response(StatusCodes.NOT_FOUND, null, 'User not found');
			}
		}
		if (result.data.designation === DESIGNATION.PATIENT) {
			user = await PatientRepo.getPatientByPhone(result.data.phone);
			if (!user) {
				return response(StatusCodes.NOT_FOUND, null, 'User not found');
			}
		}

		if (!user) {
			return response(StatusCodes.NOT_FOUND, null, 'User not found');
		}

		const storedOTP = await getOTP(result.data.phone);

		if (storedOTP !== result.data.otp) {
			return response(
				StatusCodes.BAD_REQUEST,
				null,
				'Wrong or Expired OTP. Try resending the OTP request'
			);
		}
		user.isPhoneVerified = true;
		user = await user.save();

		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return response(StatusCodes.OK, { user, accessToken }, 'OTP has been Verified');
	};
}
