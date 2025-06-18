import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { ACCOUNT } from '../interfaces';
import envVars from '../config/env-vars';

export interface ITokenPayload extends ACCOUNT {
	iat: number;
}

export function createAccessToken( user: ( Document & ACCOUNT ) | null ): string {
	return jwt.sign(
		{
			id: user?._id,
			phone: user?.phone,
			email: user?.email,
		},
		envVars.ACCESS_TOKEN_SECRET as jwt.Secret
	) as string;
}

export function createRefreshToken( user: ( Document & ACCOUNT ) | null ): string {
	return jwt.sign(
		{
			id: user?._id,
		},
		envVars.REFRESH_TOKEN_SECRET as jwt.Secret
	) as string;
}

export async function verifyRefreshToken( token: string ): Promise<ITokenPayload> {
	return new Promise( ( resolve, reject ) => {
		jwt.verify( token, envVars.REFRESH_TOKEN_SECRET as jwt.Secret, ( err, payload ) => {
			if ( err ) reject( err );
			resolve( payload as ITokenPayload );
		} );
	} );
}
