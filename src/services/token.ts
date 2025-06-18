import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import envVars from '../config/env-vars';
import { ACCOUNT } from '../interfaces';

export interface ITokenPayload extends ACCOUNT {
	iat: number;
}

export function createAccessToken(user: (Document & ACCOUNT) | null): string {
	return jwt.sign(
		{
			id: user?._id,
			phone: user?.phone,
			email: user?.email,
		},
		envVars.ACCESS_TOKEN_SECRET as jwt.Secret
	) as string;
}
