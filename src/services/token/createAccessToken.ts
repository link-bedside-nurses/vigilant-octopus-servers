import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { ACCOUNT } from '../../interfaces';
import EnvVars from "../../constants/env-vars";


export function createAccessToken( user: ( Document & ACCOUNT ) | null ): string {
	return jwt.sign(
		{
			id: user?._id,
			phone: user?.phone,
			email: user?.email,
			designation: user?.designation,
		},
		EnvVars.getAccessTokenSecret() as jwt.Secret
	) as string;
}
