import { HTTPRequest } from '../../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../../db';
import { createAccessToken } from '../../../services/token';
import { Document } from 'mongoose';
import { generateOTP, storeOTP, getOTPFromCacheStore } from '../../../services/otp/send-otp';
import cron from 'node-cron';
import { otpCacheStore } from '../../../cache-store/client';
import { sendMail } from '../../../services/email/email';
import { html } from '../../../constants/html';
import { ACCOUNT } from '../../../interfaces';

export function sendEmail() {
	async function expireOTPCache(email: string) {
		try {
			otpCacheStore.expire(email);
		} catch (error) {
			console.error('Error expiring OTP from cache:', error);
		}
	}

	return async function (request: HTTPRequest<object, object, { email: string }>) {
		try {
			const otp = generateOTP();

			await storeOTP(request.query.email, otp.toString());

			cron.schedule('*/2 * * * *', () => {
				expireOTPCache(request.query.email);
			});

			await sendMail(
				request.query.email,
				html(otp.toString()),
				'Email Verification',
				otp.toString()
			);

			return {
				statusCode: StatusCodes.OK,
				body: {
					data: null,
					message: 'Email sent successfully!',
				},
			};
		} catch (error) {
			return {
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				body: {
					data: error,
					message: 'Failed to send email',
				},
			};
		}
	};
}

export function verifyEmail() {
	return async function (request: HTTPRequest<object, { email: string; otp: string }, object>) {
		const { email, otp } = request.body;
		try {
			const cacheStoreOTP = await getOTPFromCacheStore(email);

			if (!cacheStoreOTP) {
				return {
					statusCode: StatusCodes.BAD_REQUEST,
					body: {
						data: null,
						message: 'Wrong or Expired OTP. Try resending the OTP request',
					},
				};
			}

			if (cacheStoreOTP === otp) {
				let admin;

				admin = await db.admins.findOne({ email });

				if (!admin) {
					return {
						statusCode: StatusCodes.NOT_FOUND,
						body: {
							data: null,
							message:
								'No such user with given email. Please try registering again after 5 mins',
						},
					};
				}

				admin.isEmailVerified = true;
				admin = await admin.save();

				const accessToken = createAccessToken(admin as Document & ACCOUNT);
				return {
					statusCode: StatusCodes.OK,
					body: {
						data: admin,
						accessToken,
						message: 'OTP has been Verified',
					},
				};
			}
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'Wrong OTP',
				},
			};
		} catch (error) {
			console.log('error: ', error);
			return {
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				body: {
					data: null,
					message: 'FAILED TO VERIFY OTP',
				},
			};
		}
	};
}
