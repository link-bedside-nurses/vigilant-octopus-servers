import { randomBytes, scrypt as scryptWithCallBack } from 'crypto'
import util from 'util'

const scrypt = util.promisify(scryptWithCallBack)

class Password {
	static async toHash(password: string): Promise<string> {
		const salt = randomBytes(8).toString('hex')
		const buf = (await scrypt(password, salt, 64)) as Buffer
		return `${buf.toString('hex')}.${salt}`
	}

	static async compare(storedPassword: string, suppliedPassword: string): Promise<boolean> {
		const [hash, salt] = storedPassword.split('.')
		const buf = (await scrypt(suppliedPassword, salt, 64)) as Buffer
		return buf.toString('hex') === hash
	}
}

export { Password }
