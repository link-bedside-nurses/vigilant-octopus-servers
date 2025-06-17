import * as argon2 from 'argon2';

export class Password {
	static async hash(password: string): Promise<string> {
		return await argon2.hash(password, {
			type: argon2.argon2id,
		});
	}

	static async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
		return await argon2.verify(hashedPassword, plainPassword, {
			type: argon2.argon2id,
		});
	}
}
