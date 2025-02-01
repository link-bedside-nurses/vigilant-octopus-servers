import { HTTPRequest } from '../../api/adapters/express-callback';
import { StatusCodes } from 'http-status-codes';
import { db } from '../../infra/database';
import { response } from '../../core/utils/http-response';
import { PatientRepo } from '../../infra/database/repositories/patient-repository';
import { CollectionsService } from '../../infra/external-services/payment-gateways/momo/collections/collections-service';
import { AirtelCollectionsService } from '../../infra/external-services/payment-gateways/airtel/collections/collections-service';
import { z } from 'zod';
import mongoose from 'mongoose';

const PaymentSchema = z.object( {
	amount: z.number(),
	appointment: z.string(),
	message: z.string().optional(),
	provider: z.enum( ['MTN', 'AIRTEL'] ).optional()
} );

export function getAllPayments() {
	return async function ( _: HTTPRequest<object> ) {
		const payments = await db.payments.find( {} ).sort( { createdAt: 'desc' } );
		return response( StatusCodes.OK, payments, 'Payments Retrieved' );
	};
}

export function getPaymentsByPatient() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		const payments = await db.payments.find( { patient: request.params.id } ).sort( { createdAt: 'desc' } );
		return response( StatusCodes.OK, payments, 'Payments Retrieved' );
	};
}

export function getPayment() {
	return async function ( request: HTTPRequest<{ id: string }> ) {


		const payment = await db.payments.findById( request.params.id );

		if ( !payment ) {
			return response( StatusCodes.NOT_FOUND, null, 'No Payment Found' );
		}

		return response( StatusCodes.OK, payment, 'Payment Retrieved' );
	};
}

export function makeMomoPayment() {
	return async function (
		request: HTTPRequest<{
			id: string;
		}>
	) {
		const payment = await db.payments.findByIdAndDelete( request.params.id );

		if ( !payment ) {
			return response( StatusCodes.NOT_FOUND, null, 'No Payment Found' );
		}

		return response( StatusCodes.OK, payment, 'Payment deleted' );
	};
}

export function initiatePaymentFromPatient() {
	return async function ( request: HTTPRequest<{ id: string }, z.infer<typeof PaymentSchema>> ) {
		try {
			// Validate request body
			const result = PaymentSchema.safeParse( request.body );
			if ( !result.success ) {
				return response(
					StatusCodes.BAD_REQUEST,
					null,
					`${result.error.issues[0].path} ${result.error.issues[0].message}`.toLowerCase()
				);
			}

			// Get patient details
			const patient = await PatientRepo.getPatientById( request.params.id );
			if ( !patient ) {
				return response( StatusCodes.NOT_FOUND, null, 'Patient not found' );
			}

			// Check if momo number is configured and verified
			const paymentPhone = patient.momoNumber && patient.isMomoNumberVerified
				? patient.momoNumber
				: patient.phone;

			// Determine payment provider
			const provider = result.data.provider || detectProvider( paymentPhone );
			let referenceId: string;

			// Initialize payment based on provider
			if ( provider === 'MTN' ) {
				const collectionsService = CollectionsService.getInstance();
				referenceId = await collectionsService.requestToPay(
					result.data.amount.toString(),
					paymentPhone,
					result.data.message || `Payment request for ${result.data.amount} UGX`
				);
			} else {
				const airtelService = AirtelCollectionsService.getInstance();
				referenceId = await airtelService.requestToPay(
					result.data.amount,
					paymentPhone
				);
			}

			// Create payment record in database
			const payment = await db.payments.create( {
				patient: patient.id,
				amount: result.data.amount,
				appointment: result.data.appointment,
				comment: result.data.message || `Payment request for ${result.data.amount} UGX`,
				referenceId,
				status: 'PENDING',
				paymentMethod: provider,
				createdAt: new Date()
			} );

			return response( StatusCodes.OK, {
				payment,
				referenceId
			}, 'Payment initiated successfully' );

		} catch ( error: any ) {
			console.error( 'Payment initiation failed:', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to initiate payment'
			);
		}
	};
}

// Helper function to detect provider from phone number
function detectProvider( phone: string ): 'MTN' | 'AIRTEL' {
	// Remove any country code or formatting
	const cleanPhone = phone.replace( /\D/g, '' );

	const mtnPrefixes = ['077', '078', '076'];

	const airtelPrefixes = ['070', '075'];

	for ( const prefix of mtnPrefixes ) {
		if ( cleanPhone.startsWith( prefix ) ) return 'MTN';
	}

	for ( const prefix of airtelPrefixes ) {
		if ( cleanPhone.startsWith( prefix ) ) return 'AIRTEL';
	}

	throw new Error( 'Unsupported phone number prefix' );
}

export function checkPaymentStatus() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		try {
			const payment = await db.payments.findById( request.params.id );
			if ( !payment ) {
				return response( StatusCodes.NOT_FOUND, null, 'Payment not found' );
			}

			const collectionsService = CollectionsService.getInstance();
			const status = await collectionsService.getTransactionStatus( payment.referenceId );

			// Update payment status in database
			payment.status = status.status;
			if ( status.financialTransactionId ) {
				payment.transactionId = status.financialTransactionId;
			}
			await payment.save();

			return response( StatusCodes.OK, {
				payment,
				status
			}, 'Payment status retrieved' );

		} catch ( error: any ) {
			console.error( 'Payment status check failed:', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to check payment status'
			);
		}
	};
}

export function getCaregiverEarnings() {
	return async function ( request: HTTPRequest<{ id: string }> ) {
		try {
			// Get all successful payments for appointments with this caregiver
			const payments = await db.payments.aggregate( [
				{
					$lookup: {
						from: 'appointments',
						localField: 'appointment',
						foreignField: '_id',
						as: 'appointmentDetails'
					}
				},
				{
					$unwind: '$appointmentDetails'
				},
				{
					$match: {
						'appointmentDetails.caregiver': new mongoose.Types.ObjectId( request.params.id ),
						'status': 'SUCCESSFUL'
					}
				},
				{
					$group: {
						_id: null,
						totalEarnings: { $sum: '$amount' },
						payments: { $push: '$$ROOT' }
					}
				}
			] );

			const result = payments[0] || { totalEarnings: 0, payments: [] };

			return response(
				StatusCodes.OK,
				{
					totalEarnings: result.totalEarnings,
					payments: result.payments
				},
				'Caregiver earnings retrieved successfully'
			);
		} catch ( error: any ) {
			console.error( 'Error getting caregiver earnings:', error );
			return response(
				StatusCodes.INTERNAL_SERVER_ERROR,
				null,
				'Failed to get caregiver earnings'
			);
		}
	};
}
