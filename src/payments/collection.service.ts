import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { MobileProvider, PaymentStatus } from '../database/models/Payment';
import logger from '../utils/logger';
import { ICreateCollectionRequest, MarzPayService, TransactionStatus } from './marzpay.service';

/**
 * Payment limits in UGX
 */
const PAYMENT_LIMITS = {
	MIN_AMOUNT: 500,
	MAX_AMOUNT: 10000000,
};

/**
 * Error messages
 */
const ERROR_MESSAGES = {
	INVALID_AMOUNT: 'Amount must be between 500 and 10,000,000 UGX',
	INVALID_PHONE: 'Invalid phone number format. Use +256xxxxxxxxx',
	INVALID_PROVIDER: 'Unable to detect mobile money provider',
	DUPLICATE_REFERENCE: 'Reference already exists',
	PAYMENT_NOT_FOUND: 'Payment not found',
	APPOINTMENT_NOT_FOUND: 'Appointment not found',
	PATIENT_NOT_FOUND: 'Patient not found',
	APPOINTMENT_ALREADY_PAID: 'Payment already completed for this appointment',
};

/**
 * DTO for creating a collection
 */
export interface CreateCollectionDto {
	amount: number;
	phoneNumber: string;
	appointmentId: string;
	patientId: string;
	description?: string;
	callbackUrl?: string;
	country?: string;
}

/**
 * Service for managing collection transactions (collecting payments from patients)
 */
export class CollectionService {
	private readonly marzPayService: MarzPayService;
	private readonly callbackBaseUrl: string;

	constructor() {
		this.marzPayService = MarzPayService.getInstance();
		this.callbackBaseUrl = process.env.APP_URL || 'http://localhost:3000';
	}

	/**
	 * Create a new collection transaction for an appointment
	 */
	async createCollection(dto: CreateCollectionDto) {
		try {
			// Validate amount
			this.validateAmount(dto.amount);

			// Format and validate phone number
			const phoneNumber = this.marzPayService.formatPhoneNumber(dto.phoneNumber);
			if (!this.marzPayService.validatePhoneNumber(phoneNumber)) {
				throw new Error(ERROR_MESSAGES.INVALID_PHONE);
			}

			// Detect provider
			const provider = this.marzPayService.detectProvider(phoneNumber);
			if (!provider) {
				throw new Error(ERROR_MESSAGES.INVALID_PROVIDER);
			}

			// Verify appointment exists
			const appointment = await db.appointments.findById(dto.appointmentId);
			if (!appointment) {
				throw new Error(ERROR_MESSAGES.APPOINTMENT_NOT_FOUND);
			}

			// Verify patient exists
			const patient = await db.patients.findById(dto.patientId);
			if (!patient) {
				throw new Error(ERROR_MESSAGES.PATIENT_NOT_FOUND);
			}

			// Check if appointment belongs to patient
			if (appointment.patient.toString() !== dto.patientId) {
				throw new Error('Appointment does not belong to patient');
			}

			// Check for duplicate successful payments
			const existingPaidPayment = await db.payments.findOne({
				appointment: dto.appointmentId,
				status: PaymentStatus.SUCCESSFUL,
			});
			if (existingPaidPayment) {
				throw new Error(ERROR_MESSAGES.APPOINTMENT_ALREADY_PAID);
			}

			// Generate unique reference
			const reference = this.generateReference();

			// Check for duplicate reference (should not happen with UUID but be safe)
			const existingTransaction = await db.payments.findOne({ reference });
			if (existingTransaction) {
				throw new Error(ERROR_MESSAGES.DUPLICATE_REFERENCE);
			}

			// Build callback URL
			const callbackUrl =
				dto.callbackUrl || `${this.callbackBaseUrl}/api/v1/payments/webhooks/collection`;

			// Prepare request for Marz Pay
			const request: ICreateCollectionRequest = {
				amount: dto.amount,
				phone_number: phoneNumber,
				country: dto.country || 'UG',
				reference,
				description: dto.description || `Payment for appointment ${dto.appointmentId}`,
				callback_url: callbackUrl,
			};

			// Call Marz Pay API
			const response = await this.marzPayService.createCollection(request);

			// Create payment record
			const payment = await db.payments.create({
				appointment: dto.appointmentId,
				patient: dto.patientId,
				amount: dto.amount,
				amountFormatted: this.marzPayService.formatAmount(dto.amount),
				currency: response.data.collection.amount.currency,
				reference,
				externalUuid: response.data.transaction.uuid,
				providerReference: response.data.transaction.provider_reference || undefined,
				phoneNumber,
				paymentMethod: provider.toUpperCase() as MobileProvider,
				status: this.mapStatusToPaymentStatus(response.data.transaction.status),
				mode: response.data.collection.mode,
				description: request.description,
				callbackUrl,
				country: dto.country || 'UG',
				initiatedAt: new Date(response.data.timeline.initiated_at),
				estimatedSettlement: new Date(response.data.timeline.estimated_settlement),
				apiResponse: response,
			});

			// Update appointment with payment reference and status
			await db.appointments.findByIdAndUpdate(dto.appointmentId, {
				$push: { payments: payment._id },
				paymentStatus: 'PENDING',
			});

			logger.info(`Collection created: ${payment.id} - ${payment.externalUuid}`);

			return payment;
		} catch (error) {
			logger.error('Failed to create collection:', error);
			throw error;
		}
	}

	/**
	 * Generate a unique UUID reference
	 */
	generateReference(): string {
		return uuidv4();
	}

	/**
	 * Find payment by ID
	 */
	async findById(id: string) {
		const payment = await db.payments.findById(id).populate('appointment').populate('patient');

		if (!payment) {
			throw new Error(ERROR_MESSAGES.PAYMENT_NOT_FOUND);
		}

		return payment;
	}

	/**
	 * Find payment by external UUID
	 */
	async findByExternalUuid(uuid: string) {
		const payment = await db.payments
			.findOne({ externalUuid: uuid })
			.populate('appointment')
			.populate('patient');

		if (!payment) {
			throw new Error(ERROR_MESSAGES.PAYMENT_NOT_FOUND);
		}

		return payment;
	}

	/**
	 * Find payment by reference
	 */
	async findByReference(reference: string) {
		const payment = await db.payments
			.findOne({ reference })
			.populate('appointment')
			.populate('patient');

		if (!payment) {
			throw new Error(ERROR_MESSAGES.PAYMENT_NOT_FOUND);
		}

		return payment;
	}

	/**
	 * Find all payments with optional filters
	 */
	async findAll(filters: {
		status?: PaymentStatus;
		paymentMethod?: MobileProvider;
		patientId?: string;
		appointmentId?: string;
		page?: number;
		limit?: number;
	} = {}) {
		const page = filters.page || 1;
		const limit = filters.limit || 20;
		const skip = (page - 1) * limit;

		const query: any = {};

		if (filters.status) {
			query.status = filters.status;
		}

		if (filters.paymentMethod) {
			query.paymentMethod = filters.paymentMethod;
		}

		if (filters.patientId) {
			query.patient = filters.patientId;
		}

		if (filters.appointmentId) {
			query.appointment = filters.appointmentId;
		}

		const [data, total] = await Promise.all([
			db.payments
				.find(query)
				.populate('appointment')
				.populate('patient')
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip(skip),
			db.payments.countDocuments(query),
		]);

		return { data, total, page, limit };
	}

	/**
	 * Update payment status from webhook
	 */
	async updateFromWebhook(
		uuid: string,
		status: TransactionStatus,
		providerReference: string | null,
		webhookData: any
	) {
		const payment = await this.findByExternalUuid(uuid);

		payment.status = this.mapStatusToPaymentStatus(status);
		payment.providerReference = providerReference || payment.providerReference;
		payment.webhookData = webhookData;
		payment.webhookAttempts = (payment.webhookAttempts || 0) + 1;

		if (status === 'successful') {
			payment.completedAt = new Date();
			payment.transactionId = providerReference || payment.transactionId;

			// Update appointment payment status to PAID
			await db.appointments.findByIdAndUpdate(payment.appointment, {
				paymentStatus: 'PAID',
			});
		} else if (status === 'failed' || status === 'cancelled') {
			payment.completedAt = new Date();
			payment.failureReason = webhookData.message || 'Transaction failed';

			// Update appointment payment status to FAILED
			await db.appointments.findByIdAndUpdate(payment.appointment, {
				paymentStatus: 'FAILED',
			});
		}

		await payment.save();

		logger.info(`Payment updated from webhook: ${payment.id} - Status: ${status}`);

		return payment;
	}

	/**
	 * Refresh payment status from API
	 */
	async refreshStatus(id: string) {
		const payment = await this.findById(id);

		try {
			const response = await this.marzPayService.getCollectionDetails(payment.externalUuid!);

			payment.status = this.mapStatusToPaymentStatus(response.data.transaction.status);
			payment.providerReference = response.data.transaction.provider_reference || payment.providerReference;

			if (payment.status === PaymentStatus.SUCCESSFUL && !payment.completedAt) {
				payment.completedAt = new Date();
				payment.transactionId = payment.providerReference || payment.transactionId;

				// Update appointment payment status to PAID
				await db.appointments.findByIdAndUpdate(payment.appointment, {
					paymentStatus: 'PAID',
				});
			} else if (
				(payment.status === PaymentStatus.FAILED || payment.status === PaymentStatus.CANCELLED) &&
				!payment.completedAt
			) {
				payment.completedAt = new Date();

				// Update appointment payment status to FAILED
				await db.appointments.findByIdAndUpdate(payment.appointment, {
					paymentStatus: 'FAILED',
				});
			}

			await payment.save();

			logger.info(`Payment status refreshed: ${payment.id} - Status: ${payment.status}`);

			return payment;
		} catch (error) {
			logger.error(`Failed to refresh payment status: ${id}`, error);
			throw error;
		}
	}

	/**
	 * Get payment statistics
	 */
	async getStatistics(filters: { patientId?: string; appointmentId?: string } = {}) {
		const query: any = {};

		if (filters.patientId) {
			query.patient = filters.patientId;
		}

		if (filters.appointmentId) {
			query.appointment = filters.appointmentId;
		}

		const payments = await db.payments.find(query);

		const stats = {
			total: payments.length,
			successful: 0,
			pending: 0,
			failed: 0,
			totalAmount: 0,
			successfulAmount: 0,
		};

		payments.forEach((payment) => {
			stats.totalAmount += payment.amount;

			switch (payment.status) {
				case PaymentStatus.SUCCESSFUL:
					stats.successful += 1;
					stats.successfulAmount += payment.amount;
					break;
				case PaymentStatus.PENDING:
				case PaymentStatus.PROCESSING:
					stats.pending += 1;
					break;
				case PaymentStatus.FAILED:
				case PaymentStatus.CANCELLED:
					stats.failed += 1;
					break;
			}
		});

		return stats;
	}

	/**
	 * Validate amount is within limits
	 */
	private validateAmount(amount: number): void {
		if (amount < PAYMENT_LIMITS.MIN_AMOUNT || amount > PAYMENT_LIMITS.MAX_AMOUNT) {
			throw new Error(ERROR_MESSAGES.INVALID_AMOUNT);
		}
	}

	/**
	 * Cancel a pending payment
	 */
	async cancelPayment(id: string) {
		const payment = await this.findById(id);

		if (
			payment.status !== PaymentStatus.PENDING &&
			payment.status !== PaymentStatus.PROCESSING
		) {
			throw new Error('Can only cancel pending or processing payments');
		}

		payment.status = PaymentStatus.CANCELLED;
		payment.completedAt = new Date();

		await payment.save();

		// Update appointment payment status
		await db.appointments.findByIdAndUpdate(payment.appointment, {
			paymentStatus: 'FAILED',
		});

		logger.info(`Payment cancelled: ${payment.id}`);

		return payment;
	}

	/**
	 * Map MarzPay transaction status to internal PaymentStatus
	 */
	private mapStatusToPaymentStatus(status: TransactionStatus): PaymentStatus {
		switch (status) {
			case 'pending':
				return PaymentStatus.PENDING;
			case 'processing':
				return PaymentStatus.PROCESSING;
			case 'successful':
				return PaymentStatus.SUCCESSFUL;
			case 'failed':
				return PaymentStatus.FAILED;
			case 'cancelled':
				return PaymentStatus.CANCELLED;
			case 'sandbox':
				return PaymentStatus.SANDBOX;
			default:
				return PaymentStatus.PENDING;
		}
	}
}
