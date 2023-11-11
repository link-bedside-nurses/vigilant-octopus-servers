import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { generateOTP, getOTPFromRedis, storeOTP } from '@/services/otp/send-otp'
import { EnvironmentVars } from '@/constants'
import twilio from 'twilio'
import { DESIGNATION } from '@/interfaces/designations'
import { db } from '@/db'

const client = twilio(EnvironmentVars.getTwilioAccountSID(), EnvironmentVars.getTwilioAuthToken())

export function getOTP() {
	return async function (request: HTTPRequest<object, { toPhone: string }>) {
		try {
			const otp = generateOTP()

			await storeOTP(request.body.toPhone, otp.toString())
			const message = await client.messages.create({
				to: request.body.toPhone,
				from: EnvironmentVars.getFromSMSPhone(),
				body: `Your OTP is: ${otp}`,
			})

			return {
				statusCode: StatusCodes.OK,
				body: {
					data: message,
					message: 'OTP generated successfully!',
				},
			}
		} catch (error) {
			return {
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				body: {
					data: error,
					message: 'Failed to generate OTP',
				},
			}
		}
	}
}

export function verifyOTP() {
	return async function (request: HTTPRequest<object, { phone: string; otp: number; designation: DESIGNATION }>) {
		const { phone, otp, designation } = request.body

		const phoneNumber = phone.split('+')[1]

		const redisOTP = await getOTPFromRedis(phone)

		if (!redisOTP) {
			return {
				statusCode: StatusCodes.OK,
				body: {
					data: null,
					message: 'Wrong or Expired OTP. Try resending the OTP request',
				},
			}
		}

		if (redisOTP === otp.toString()) {
			let user
			if (designation === DESIGNATION.CAREGIVER) {
				user = await db.caregivers.findOne({ phone: phoneNumber })
			} else if (designation === DESIGNATION.PATIENT) {
				user = await db.patients.findOne({ phone: phoneNumber })
			} else {
				return {
					statusCode: StatusCodes.BAD_REQUEST,
					body: {
						data: null,
						message: 'Only patients or caregivers can access this route',
					},
				}
			}

			if (!user) {
				return {
					statusCode: StatusCodes.NOT_FOUND,
					body: {
						data: null,
						message: 'No such user with given phone. Please try registering again after 5 mins',
					},
				}
			}

			user.isPhoneVerified = true
			await user.save()

			return {
				statusCode: StatusCodes.OK,
				body: {
					data: user,
					message: 'OTP has been Verified',
				},
			}
		}
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: null,
				message: 'Wrong OTP',
			},
		}
	}
}
