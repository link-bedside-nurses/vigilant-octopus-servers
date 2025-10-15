import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import envars from '../config/env-vars';
import logger from '../utils/logger';

/**
 * Mobile money provider types
 */
export type MobileProvider = 'mtn' | 'airtel';

/**
 * Transaction status types
 */
export type TransactionStatus =
	| 'pending'
	| 'processing'
	| 'successful'
	| 'failed'
	| 'cancelled'
	| 'sandbox';

/**
 * Amount information
 */
export interface IAmount {
	formatted: string;
	raw: number;
	currency: string;
}

/**
 * Transaction information from API
 */
export interface ITransactionInfo {
	uuid: string;
	reference: string;
	status: TransactionStatus;
	provider_reference: string | null;
}

/**
 * Collection information
 */
export interface ICollectionInfo {
	amount: IAmount;
	provider: MobileProvider;
	phone_number: string;
	mode: 'live' | 'sandbox';
}

/**
 * Timeline information
 */
export interface ITimeline {
	initiated_at: string;
	estimated_settlement: string;
}

/**
 * Collection response from Marz Pay API
 */
export interface ICollectionResponse {
	status: 'success' | 'error';
	message: string;
	data: {
		transaction: ITransactionInfo;
		collection: ICollectionInfo;
		timeline: ITimeline;
	};
}

/**
 * Transaction details response
 */
export interface ITransactionDetailsResponse {
	status: 'success' | 'error';
	message: string;
	data: {
		transaction: ITransactionInfo;
		details: ICollectionInfo;
		timeline: ITimeline;
	};
}

/**
 * Create collection request
 */
export interface ICreateCollectionRequest {
	amount: number;
	phone_number: string;
	country: string;
	reference: string;
	description?: string;
	callback_url?: string;
}

/**
 * Service for interacting with Marz Pay API
 */
export class MarzPayService {
	private readonly baseUrl: string;
	private readonly apiCredentials: string;
	private readonly httpClient: AxiosInstance;
	private static instance: MarzPayService;

	private constructor() {
		this.baseUrl = envars.MARZ_PAY_BASE_URL;

		const apiKey = envars.MARZ_PAY_API_KEY;
		const apiSecret = envars.MARZ_PAY_API_SECRET;

		// Create Basic Auth credentials
		if (apiKey && apiSecret) {
			const credentials = `${apiKey}:${apiSecret}`;
			this.apiCredentials = Buffer.from(credentials).toString('base64');
		} else {
			logger.warn('Marz Pay API credentials not configured');
			this.apiCredentials = '';
		}

		// Create axios instance
		this.httpClient = axios.create({
			baseURL: this.baseUrl,
			timeout: 30000,
			headers: {
				Authorization: `Basic ${this.apiCredentials}`,
			},
		});
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): MarzPayService {
		if (!MarzPayService.instance) {
			MarzPayService.instance = new MarzPayService();
		}
		return MarzPayService.instance;
	}

	/**
	 * Create a collection request
	 */
	async createCollection(request: ICreateCollectionRequest): Promise<ICollectionResponse> {
		try {
			logger.info(`Creating collection for ${request.phone_number}, amount: ${request.amount}`);

			const formData = new FormData();
			formData.append('phone_number', request.phone_number);
			formData.append('amount', request.amount.toString());
			formData.append('country', request.country);
			formData.append('reference', request.reference);

			if (request.description) {
				formData.append('description', request.description);
			}

			if (request.callback_url) {
				formData.append('callback_url', request.callback_url);
			}

			const config: AxiosRequestConfig = {
				headers: {
					...formData.getHeaders(),
					Authorization: `Basic ${this.apiCredentials}`,
				},
			};

			const response = await this.httpClient.post<ICollectionResponse>(
				'/collect-money',
				formData,
				config
			);

			logger.info(`Collection created successfully: ${response.data.data.transaction.uuid}`);
			return response.data;
		} catch (error) {
			this.handleApiError('createCollection', error);
		}
	}

	/**
	 * Get collection details by UUID
	 */
	async getCollectionDetails(uuid: string): Promise<ITransactionDetailsResponse> {
		try {
			logger.info(`Fetching collection details for UUID: ${uuid}`);

			const response = await this.httpClient.get<ITransactionDetailsResponse>(
				`/collect-money/${uuid}`
			);

			return response.data;
		} catch (error) {
			this.handleApiError('getCollectionDetails', error);
		}
	}

	/**
	 * Handle API errors with proper logging
	 */
	private handleApiError(method: string, error: any): never {
		if (axios.isAxiosError(error)) {
			const axiosError = error as AxiosError;
			const status = axiosError.response?.status;
			const message = (axiosError.response?.data as any)?.message || axiosError.message;
			const errors = (axiosError.response?.data as any)?.errors;
			const responseData = axiosError.response?.data;

			logger.error(
				`${method} failed - Status: ${status}, Message: ${message}`,
				errors ? JSON.stringify(errors) : undefined
			);

			if (responseData) {
				logger.debug(`Response data: ${JSON.stringify(responseData)}`);
			}

			// Construct detailed error message
			let clientMessage = message || 'Payment gateway error';

			// Add field-specific errors if available
			if (errors && typeof errors === 'object') {
				const errorMessages = Object.entries(errors)
					.map(([field, messages]) => {
						if (Array.isArray(messages)) {
							return `${field}: ${messages.join(', ')}`;
						}
						return `${field}: ${messages}`;
					})
					.join('; ');

				if (errorMessages) {
					clientMessage = `${message}. Details: ${errorMessages}`;
				}
			}

			const errorObj: any = new Error(clientMessage);
			errorObj.statusCode = status || 503;
			errorObj.provider = 'Marz Pay';
			errorObj.errors = errors;
			throw errorObj;
		} else {
			logger.error(`${method} failed with unexpected error:`, error);
			const errorObj: any = new Error('Payment service error. Please try again later.');
			errorObj.statusCode = 503;
			errorObj.provider = 'Marz Pay';
			throw errorObj;
		}
	}

	/**
	 * Detect mobile money provider from phone number
	 */
	detectProvider(phoneNumber: string): MobileProvider | null {
		// Remove spaces and dashes
		const cleanNumber = phoneNumber.replace(/[\s-]/g, '');

		// MTN patterns: 076x, 077x, 078x, 031x, 039x
		if (/^(\+256|256|0)(76[0-9]|77[0-9]|78[0-9]|31[0-9]|39[0-9])/.test(cleanNumber)) {
			return 'mtn';
		}

		// Airtel patterns: 070x-075x
		if (/^(\+256|256|0)(70[0-5]|75[0-9])/.test(cleanNumber)) {
			return 'airtel';
		}

		return null;
	}

	/**
	 * Validate phone number format
	 */
	validatePhoneNumber(phoneNumber: string): boolean {
		const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
		return /^\+256[0-9]{9}$/.test(cleanNumber);
	}

	/**
	 * Format phone number to international format
	 */
	formatPhoneNumber(phoneNumber: string): string {
		let cleanNumber = phoneNumber.replace(/[\s-]/g, '');

		// Convert 0xxx to +256xxx
		if (cleanNumber.startsWith('0')) {
			cleanNumber = '+256' + cleanNumber.substring(1);
		}

		// Convert 256xxx to +256xxx
		if (cleanNumber.startsWith('256') && !cleanNumber.startsWith('+256')) {
			cleanNumber = '+' + cleanNumber;
		}

		// Ensure it starts with +256
		if (!cleanNumber.startsWith('+256')) {
			cleanNumber = '+256' + cleanNumber;
		}

		return cleanNumber;
	}

	/**
	 * Format amount for display
	 */
	formatAmount(amount: number): string {
		return new Intl.NumberFormat('en-UG', {
			style: 'decimal',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
	}
}
