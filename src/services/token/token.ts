import jwt from 'jsonwebtoken'
import EnvVars from '@/constants/env-vars'
import { Document } from 'mongoose'
import { ACCOUNT } from '@/interfaces'

export interface ITokenPayload extends ACCOUNT {
	iat: number
}

export function createAccessToken(user: (Document & ACCOUNT) | null): string {
	return jwt.sign(
		{
			id: user?.id,
			phone: user?.phone,
			designation: user?.designation,
		},
		EnvVars.getAccessTokenSecret() as jwt.Secret,
		{
			expiresIn: '5m',
		},
	) as string
}

export function createRefreshToken(user: (Document & ACCOUNT) | null): string {
	return jwt.sign(
		{
			id: user?.id,
		},
		EnvVars.getRefreshTokenSecret() as jwt.Secret,
		{
			expiresIn: '10m',
		},
	) as string
}

export async function verifyRefreshToken(token: string): Promise<ITokenPayload> {
	return new Promise((resolve, reject) => {
		jwt.verify(token, EnvVars.getRefreshTokenSecret() as jwt.Secret, (err, payload) => {
			if (err) reject(err)
			resolve(payload as ITokenPayload)
		})
	})
}
