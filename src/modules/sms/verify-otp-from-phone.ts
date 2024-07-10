import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { createAccessToken } from '../../services/token';
import { Document } from 'mongoose';
import { DESIGNATION, ACCOUNT } from '../../core/interfaces';
import { response } from '../../core/utils/http-response';
import { getOTP } from '../../services/otp';
import { VerifyPhoneDto, VerifyPhoneSchema } from '../../core/interfaces/dtos';
import { CaregiverRepo } from '../../infra/database/repositories/caregiver-repository';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';

export function verifyOTPFromPhone() {
	return async function (request: HTTPRequest<object, object, VerifyPhoneDto>) {
		const result = VerifyPhoneSchema.safeParse(request.query);
		if (!result.success) {
			return response(
				StatusCodes.OK,
				null,
				`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
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
			user = await CaregiverRepo.getCaregiverByPhone(result.data.phone);
		} else if (result.data.designation === DESIGNATION.PATIENT) {
			user = await PatientRepo.getPatientByPhone(result.data.phone);
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
