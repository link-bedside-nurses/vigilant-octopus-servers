import { db } from '../database';
import logger from '../utils/logger';
import { CollectionService } from './collection.service';
import { TransactionStatus } from './marzpay.service';

/**
 * Webhook payload from Marz Pay
 */
export interface IWebhookPayload {
	event: string;
	transaction: {
		uuid: string;
		reference: string;
		status: TransactionStatus;
		provider_reference: string | null;
		amount: number;
		currency: string;
		phone_number: string;
		provider: string;
		type: 'collection' | 'disbursement';
	};
	timestamp: string;
}

/**
 * Service for processing webhook notifications from Marz Pay
 */
export class WebhookService {
	private readonly collectionService: CollectionService;

	constructor() {
		this.collectionService = new CollectionService();
	}

	/**
	 * Process incoming webhook
	 */
	async processWebhook(
		payload: IWebhookPayload,
		headers?: Record<string, string>,
		senderIp?: string
	) {
		try {
			logger.info(
				`Processing webhook - Event: ${payload.event}, UUID: ${payload.transaction.uuid}`
			);

			// Process the webhook based on transaction type
			if (payload.transaction.type === 'collection') {
				await this.processCollectionWebhook(payload);
			} else {
				logger.warn(`Unknown transaction type: ${payload.transaction.type}`);
			}

			return {
				success: true,
				message: 'Webhook processed successfully',
			};
		} catch (error) {
			logger.error('Failed to process webhook:', error);
			throw error;
		}
	}

	/**
	 * Process collection webhook
	 */
	private async processCollectionWebhook(payload: IWebhookPayload): Promise<void> {
		try {
			const status = payload.transaction.status;

			await this.collectionService.updateFromWebhook(
				payload.transaction.uuid,
				status,
				payload.transaction.provider_reference,
				payload
			);

			logger.info(
				`Collection webhook processed: ${payload.transaction.uuid} - Status: ${status}`
			);
		} catch (error) {
			logger.error('Failed to process collection webhook:', error);
			throw error;
		}
	}

	/**
	 * Get webhook by transaction UUID
	 */
	async findByTransactionUuid(uuid: string) {
		const payment = await db.payments
			.findOne({ externalUuid: uuid })
			.populate('appointment')
			.populate('patient');

		return payment;
	}

	/**
	 * Get webhook by transaction reference
	 */
	async findByTransactionReference(reference: string) {
		const payment = await db.payments
			.findOne({ reference })
			.populate('appointment')
			.populate('patient');

		return payment;
	}
}
