import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { ACCOUNT } from '../core/interfaces';
import envVars from '../config/constants/env-vars';

export interface ITokenPayload extends ACCOUNT {
	iat: number;
}

export function createAccessToken(user: (Document & ACCOUNT) | null): string {
	return jwt.sign(
		{
			id: user?._id,
			phone: user?.phone,
			email: user?.email,
			designation: user?.designation,
		},
		envVars.ACCESS_TOKEN_SECRET as jwt.Secret
	) as string;
}

export function createRefreshToken(user: (Document & ACCOUNT) | null): string {
	return jwt.sign(
		{
			id: user?._id,
			designation: user?.designation,
		},
		envVars.REFRESH_TOKEN_SECRET as jwt.Secret
	) as string;
}

export async function verifyRefreshToken(token: string): Promise<ITokenPayload> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, envVars.REFRESH_TOKEN_SECRET as jwt.Secret, (err, payload) => {
			if (err) reject(err);
			resolve(payload as ITokenPayload);
		});
	});
}
