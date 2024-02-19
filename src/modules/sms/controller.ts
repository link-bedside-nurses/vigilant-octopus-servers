import { HTTPRequest } from '@/adapters/express-callback'
import { StatusCodes } from 'http-status-codes'
import { DESIGNATION } from '@/interfaces/designations'
import { db } from '@/db'
import { ACCOUNT } from '@/interfaces'
import { createAccessToken } from '@/services/token/token'
import { Document } from 'mongoose'
import sendOTP, { generateOTP, storeOTP, getOTPFromRedis } from '@/services/otp/send-otp'

export function getOTP() {
	return async function ( request: HTTPRequest<object, object, { toPhone: string }> ) {
		try {
			const otp = generateOTP()

			await storeOTP( request.query.toPhone, otp.toString() )

			const response = await sendOTP( request.query.toPhone, String( otp ) )

			return {
				statusCode: StatusCodes.OK,
				body: {
					data: JSON.parse( response.config.data ),
					message: 'OTP generated successfully!',
				},
			}
		} catch ( error ) {
			console.log( "error: ", error )
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
	return async function ( request: HTTPRequest<object, { phone: string; otp: string; designation: DESIGNATION }, object> ) {
		const { phone, otp, designation } = request.body
		console.log( "req: ", request.body )
		try {

			const redisOTP = await getOTPFromRedis( phone )

			if ( !redisOTP ) {
				return {
					statusCode: StatusCodes.BAD_REQUEST,
					body: {
						data: null,
						message: 'Wrong or Expired OTP. Try resending the OTP request',
					},
				}
			}

			if ( redisOTP === otp ) {
				let user
				if ( designation === DESIGNATION.NURSE ) {
					user = await db.caregivers.findOne( { phone } )
				} else if ( designation === DESIGNATION.PATIENT ) {
					user = await db.patients.findOne( { phone } )
				} else {
					return {
						statusCode: StatusCodes.BAD_REQUEST,
						body: {
							data: null,
							message: 'Only patients or caregivers can access this route',
						},
					}
				}

				if ( !user ) {
					return {
						statusCode: StatusCodes.NOT_FOUND,
						body: {
							data: null,
							message: 'No such user with given phone. Please try registering again after 5 mins',
						},
					}
				}

				user.isPhoneVerified = true
				user = await user.save()

				const accessToken = createAccessToken( user as Document & ACCOUNT )

				return {
					statusCode: StatusCodes.OK,
					body: {
						data: user,
						accessToken,
						message: 'OTP has been Verified',
					},
				}
			}
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: null,
					message: 'Wrong OTP',
				},
			}
		} catch ( error ) {
			console.log( "error: ", error )
			return {
				statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
				body: {
					data: null,
					message: 'FAILED TO VERIFY OTP',
				},
			}
		}
	}
}
