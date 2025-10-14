import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import logger from '../utils/logger';

// Use the global Redis instance from server.ts
const getRedis = (): Redis => {
	if (!(global as any).redis) {
		throw new Error('Redis not initialized. Make sure the server has started.');
	}
	return (global as any).redis;
};

const PASSWORD_SETUP_TOKEN_EXPIRY = 300; // 5 minutes in seconds
const PASSWORD_SETUP_TOKEN_LENGTH = 32; // bytes

/**
 * Service for managing admin password setup and activation tokens
 */
class AdminTokenService {
	private static instance: AdminTokenService;

	private constructor() {}

	public static getInstance(): AdminTokenService {
		if (!AdminTokenService.instance) {
			AdminTokenService.instance = new AdminTokenService();
		}
		return AdminTokenService.instance;
	}

	/**
	 * Generate a secure random token
	 */
	private generateToken(): string {
		return randomBytes(PASSWORD_SETUP_TOKEN_LENGTH).toString('hex');
	}

	/**
	 * Create password setup token for new admin
	 */
	public async createPasswordSetupToken(
		email: string,
		expiryTime: number = PASSWORD_SETUP_TOKEN_EXPIRY
	): Promise<{ token: string; expiresAt: Date }> {
		try {
			const token = this.generateToken();
			const key = `admin:password-setup:${token}`;

			// Store email associated with token
			await getRedis().setex(key, expiryTime, email);

			logger.info(`Password setup token created for ${email}, expires in ${expiryTime} seconds`);

			return {
				token,
				expiresAt: new Date(Date.now() + expiryTime * 1000),
			};
		} catch (error) {
			logger.error(`Failed to create password setup token for ${email}:`, error);
			throw new Error('Failed to generate password setup token');
		}
	}

	/**
	 * Verify and retrieve email from password setup token
	 */
	public async verifyPasswordSetupToken(token: string): Promise<string | null> {
		try {
			const key = `admin:password-setup:${token}`;
			const email = await getRedis().get(key);

			if (!email) {
				logger.warn(`Invalid or expired password setup token: ${token}`);
				return null;
			}

			return email;
		} catch (error) {
			logger.error(`Failed to verify password setup token:`, error);
			return null;
		}
	}

	/**
	 * Invalidate password setup token after use
	 */
	public async invalidatePasswordSetupToken(token: string): Promise<void> {
		try {
			const key = `admin:password-setup:${token}`;
			await getRedis().del(key);
			logger.info(`Password setup token invalidated: ${token}`);
		} catch (error) {
			logger.error(`Failed to invalidate password setup token:`, error);
		}
	}

	/**
	 * Create activation token for super admin approval
	 */
	public async createActivationToken(
		adminId: string,
		expiryTime: number = 86400 // 24 hours
	): Promise<{ token: string; expiresAt: Date }> {
		try {
			const token = this.generateToken();
			const key = `admin:activation:${token}`;

			// Store admin ID associated with token
			await getRedis().setex(key, expiryTime, adminId);

			logger.info(`Activation token created for admin ${adminId}, expires in ${expiryTime} seconds`);

			return {
				token,
				expiresAt: new Date(Date.now() + expiryTime * 1000),
			};
		} catch (error) {
			logger.error(`Failed to create activation token for admin ${adminId}:`, error);
			throw new Error('Failed to generate activation token');
		}
	}

	/**
	 * Verify activation token
	 */
	public async verifyActivationToken(token: string): Promise<string | null> {
		try {
			const key = `admin:activation:${token}`;
			const adminId = await getRedis().get(key);

			if (!adminId) {
				logger.warn(`Invalid or expired activation token: ${token}`);
				return null;
			}

			return adminId;
		} catch (error) {
			logger.error(`Failed to verify activation token:`, error);
			return null;
		}
	}

	/**
	 * Invalidate activation token after use
	 */
	public async invalidateActivationToken(token: string): Promise<void> {
		try {
			const key = `admin:activation:${token}`;
			await getRedis().del(key);
			logger.info(`Activation token invalidated: ${token}`);
		} catch (error) {
			logger.error(`Failed to invalidate activation token:`, error);
		}
	}

	/**
	 * Check if a token exists (for any type)
	 */
	public async tokenExists(token: string, type: 'password-setup' | 'activation'): Promise<boolean> {
		try {
			const key = `admin:${type}:${token}`;
			const exists = await getRedis().exists(key);
			return exists === 1;
		} catch (error) {
			logger.error(`Failed to check token existence:`, error);
			return false;
		}
	}

	/**
	 * Get token expiry time
	 */
	public async getTokenTTL(token: string, type: 'password-setup' | 'activation'): Promise<number> {
		try {
			const key = `admin:${type}:${token}`;
			const ttl = await getRedis().ttl(key);
			return ttl > 0 ? ttl : 0;
		} catch (error) {
			logger.error(`Failed to get token TTL:`, error);
			return 0;
		}
	}
}

export const adminTokenService = AdminTokenService.getInstance();
