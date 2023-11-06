import argon2 from 'argon2'
import { randomBytes } from 'crypto'

class Passwd {
	static async toHash(password: string): Promise<string> {
		const salt = randomBytes(32) // Generate a random salt
		const hashedPassword = await argon2.hash(password, { salt })
		return hashedPassword
	}

	static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
		try {
			return await argon2.verify(storedPassword, suppliedPassword)
		} catch (error) {
			// Handle verification error (e.g., invalid hash format)
			return false
		}
	}
}

export { Passwd }
