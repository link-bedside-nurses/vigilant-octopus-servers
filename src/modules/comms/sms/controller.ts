import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../../db';
import { createAccessToken } from '../../../services/token';
import { Document } from 'mongoose';
import sendOTP, {
	generateOTP,
	storeOTP,
	getOTPFromCacheStore,
} from '../../../services/otp/send-otp';
import cron from 'node-cron';
import { otpCacheStore } from '../../../cache-store/client';
import { DESIGNATION, ACCOUNT } from '../../../interfaces';
import { response } from '../../../utils/http-response';

export function getOTP() {
	function expireOTPCache(phoneNumber: string) {
		try {
			otpCacheStore.expire(phoneNumber);
		} catch (error) {
			console.error('Error expiring OTP from cache:', error);
		}
	}

	return async function (request: HTTPRequest<object, object, { toPhone: string }>) {
		try {
			const otp = generateOTP();

			await storeOTP(request.query.toPhone, otp.toString());

			cron.schedule('*/2 * * * *', async () => {
				expireOTPCache(request.query.toPhone);
			});

			const otpResponse = await sendOTP(request.query.toPhone, String(otp));

			return response(
				StatusCodes.OK,
				JSON.parse(otpResponse.config.data),
				'OTP generated successfully!'
			);
		} catch (error) {
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				error as unknown as Error,
				'Failed to generate OTP'
			);
		}
	};
}

export function verifyOTP() {
	return async function (
		request: HTTPRequest<object, { phone: string; otp: string; designation: DESIGNATION }, object>
	) {
		const { phone, otp, designation } = request.body;
		try {
			const cacheStoreOTP = await getOTPFromCacheStore(phone);

			if (!cacheStoreOTP) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					'Wrong or Expired OTP. Try resending the OTP request'
				);
			}

			if (cacheStoreOTP === otp) {
				let user;
				if (designation === DESIGNATION.NURSE) {
					user = await db.caregivers.findOne({ phone });
				} else if (designation === DESIGNATION.PATIENT) {
					user = await db.patients.findOne({ phone });
				} else {
					return response(
						StatusCodes.BAD_REQUEST,
						null,
						'Only patients or caregivers can access this route'
					);
				}

				if (!user) {
					return response(
						StatusCodes.NOT_FOUND,
						null,
						'No such user with given phone. Please try registering again after 5 mins'
					);
				}

				user.isPhoneVerified = true;
				user = await user.save();

				const accessToken = createAccessToken(user as Document & ACCOUNT);

				return response(StatusCodes.OK, { user, accessToken }, 'OTP has been Verified');
			}
			return response(StatusCodes.BAD_REQUEST, null, 'Wrong OTP');
		} catch (error) {
			console.log('error: ', error);
			return response(StatusCodes.INTERNAL_SERVER_ERROR, null, 'FAILED TO VERIFY OTP');
		}
	};
}
