import { HTTPRequest } from '../../adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../db';
import { createAccessToken } from '../../services/token';
import { Document } from 'mongoose';
import { DESIGNATION, ACCOUNT } from '../../interfaces';

export function deleteAccount() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return async function (_: HTTPRequest<object, object, object>) {
		return {
			statusCode: StatusCodes.OK,
			body: {
				data: null,
				message: 'account deleted',
			},
		};
	};
}

export function getAccessToken() {
	return async function (request: HTTPRequest<object, object, { designation: DESIGNATION }>) {
		const designation = request.query.designation;

		if (!designation) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					message: 'Designation must be specified',
					data: null,
				},
			};
		}

		let user;
		if (designation === DESIGNATION.PATIENT) {
			user = await db.patients.findById(request.account?.id);
		} else if (designation === DESIGNATION.NURSE) {
			user = await db.caregivers.findById(request.account?.id);
		} else if (designation === DESIGNATION.ADMIN) {
			user = await db.caregivers.findById(request.account?.id);
		} else {
			return {
				statusCode: StatusCodes.UNAUTHORIZED,
				body: {
					message: 'Invalid Designation',
					data: null,
				},
			};
		}

		if (!user) {
			return {
				statusCode: StatusCodes.BAD_REQUEST,
				body: {
					data: user,
					message: 'No user found',
				},
			};
		}

		const accessToken = createAccessToken(user as Document & ACCOUNT);

		return {
			statusCode: StatusCodes.OK,
			body: {
				data: null,
				accessToken,
				message: 'Access token has been reset!',
			},
		};
	};
}
