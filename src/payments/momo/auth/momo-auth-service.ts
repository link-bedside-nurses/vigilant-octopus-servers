import { v4 as uuidv4 } from 'uuid';
import logger from '../../../utils/logger';
import { createMomoApiKey } from './api-key';
import { createMomoAPIUser } from './api-user';
import { getMomoApiUserInfo } from './create-token';

export class MomoAuthService {
	private static instance: MomoAuthService;
	private apiKey?: string;
	private referenceId: string;
	private isInitialized = false;

	private constructor() {
		this.referenceId = uuidv4();
	}

	public static getInstance(): MomoAuthService {
		if (!MomoAuthService.instance) {
			MomoAuthService.instance = new MomoAuthService();
		}
		return MomoAuthService.instance;
	}

	public async initialize(callbackHost: string): Promise<void> {
		if (this.isInitialized) {
			logger.info('MOMO API User already initialized.');
			return;
		}
		try {
			// Step 1: Create API User
			await createMomoAPIUser(this.referenceId, callbackHost);

			// Step 2: Generate API Key
			this.apiKey = await createMomoApiKey(this.referenceId);

			// Step 3: Verify API User creation
			await getMomoApiUserInfo(this.referenceId);

			logger.info('MOMO API User initialized successfully');
			this.isInitialized = true;
		} catch (error) {
			console.error('Failed to initialize MOMO API User:', error);
			throw error;
		}
	}

	public getApiKey(): string {
		if (!this.apiKey || !this.isInitialized) {
			throw new Error('API Key not initialized. Call initialize() first.');
		}
		return this.apiKey;
	}

	public getReferenceId(): string {
		return this.referenceId;
	}
}
