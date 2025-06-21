import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import envVars from '../config/env-vars';

export function createAccessToken(user: Document): string {
	console.log('user id:', user._id.toString());

	return jwt.sign(
		{
			id: user._id.toString(),
		},
		envVars.ACCESS_TOKEN_SECRET as jwt.Secret
	) as string;
}
