import { db } from '../../db';
import { TUser } from '../../interfaces';

export class AuthRepo {
	public static async createUser({ designation, email, firstName, lastName, password }: TUser) {
		return await db.admins.create({
			email,
			firstName,
			lastName,
			designation,
			password,
		});
	}
}
