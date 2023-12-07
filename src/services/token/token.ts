import jwt from 'jsonwebtoken'
import EnvVars from '@/constants/env-vars'
import { Document } from 'mongoose'
import { ACCOUNT } from '@/interfaces'

export interface ITokenPayload extends ACCOUNT {
	iat: number
}

export function createAccessToken( user: ( Document & ACCOUNT ) | null ): string {
	return jwt.sign(
		{
			id: user?._id,
			phone: user?.phone,
			designation: user?.designation,
		},
		EnvVars.getAccessTokenSecret() as jwt.Secret,
	) as string
}

export function createRefreshToken( user: ( Document & ACCOUNT ) | null ): string {
	return jwt.sign(
		{
			id: user?._id,
			designation: user?.designation,
		},
		EnvVars.getRefreshTokenSecret() as jwt.Secret,
	) as string
}

export async function verifyRefreshToken( token: string ): Promise<ITokenPayload> {
	return new Promise( ( resolve, reject ) => {
		jwt.verify( token, EnvVars.getRefreshTokenSecret() as jwt.Secret, ( err, payload ) => {
			if ( err ) reject( err )
			resolve( payload as ITokenPayload )
		} )
	} )
}
