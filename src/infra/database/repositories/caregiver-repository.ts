import { db } from '..';
import { CreateCaregiverDto, UpdateCaregiverDto } from '../../../core/interfaces/dtos';
import { APPOINTMENT_STATUSES } from '../../../core/interfaces';
import { CaregiverCancellationService } from '../../../services/caregiver-cancellation';
import { WeeklySchedule } from '../models/Caregiver';

export class CaregiverRepo {
	public static async getCaregiverById( id: string ) {
		return await db.caregivers.findById( id );
	}

	public static async getAllCaregivers() {
		return await db.caregivers.find( {} ).sort( { createdAt: 'desc' } );
	}

	public static async getAllCaregiversByCoords( latLng: string ) {
		console.log( 'latLng', latLng );
		const latitude = latLng?.split( ',' )[0];
		const longitude = latLng?.split( ',' )[1];

		if ( !latitude || !longitude ) {
			throw new Error( "Missing either latitude or longitude on the 'latLng' query key" );
		}
		return await db.caregivers.find( {
			location: {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: [longitude, latitude],
					},
				},
			},
		} );
	}

	public static async getCaregiverByPhone( phone: string ) {
		return await db.caregivers.findOne( { phone } );
	}

	public static async getCaregiverByEmail( email: string ) {
		return await db.caregivers.findOne( { email } );
	}

	public static async createCaregiver( caregiver: CreateCaregiverDto ) {
		return ( await db.caregivers.create( caregiver ) ).save();
	}

	public static async deleteCaregiver( id: string ) {
		// Cancel any pending appointments
		await db.appointments.updateMany(
			{ caregiver: id, status: APPOINTMENT_STATUSES.PENDING },
			{ $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Caregiver account deleted' } }
		);

		// Remove caregiver from any in-progress appointments
		await db.appointments.updateMany(
			{ caregiver: id, status: APPOINTMENT_STATUSES.IN_PROGRESS },
			{ $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Caregiver account deleted' } }
		);

		// Delete the caregiver document
		return await db.caregivers.findByIdAndDelete( id );
	}

	public static async markCaregiverForDeletion( id: string ) {
		// Mark the account for deletion (to be processed within 7 days)
		return await db.caregivers.findByIdAndUpdate(
			id,
			{
				markedForDeletion: true,
				deletionRequestDate: new Date(),
				isActive: false // Deactivate immediately
			},
			{ new: true }
		);
	}

	public static async deactivateCaregiver( id: string ) {
		return await db.caregivers.findByIdAndUpdate( id, { $set: { isActive: false } }, { new: true } );
	}
	public static async findByIdAndUpdate( id: string, caregiver: UpdateCaregiverDto ) {
		return await db.caregivers.findByIdAndUpdate(
			id,
			{
				phone: caregiver.phone,
				firstName: caregiver.firstName,
				lastName: caregiver.lastName,
				dateOfBirth: caregiver.dateOfBirth,
				nin: caregiver.nin,
				experience: caregiver.experience,
				description: caregiver.description,
				location: caregiver.location,
				imageUrl: caregiver.imageUrl,
			},
			{ new: true }
		);
	}

	public static async verifyCaregiver( id: string ) {
		return await db.caregivers.findByIdAndUpdate(
			id,
			{ isVerified: true, isActive: true },
			{ new: true }
		);
	}

	public static async banCaregiver( id: string ) {
		return await db.caregivers.findByIdAndUpdate( id, { isBanned: true }, { new: true } );
	}

	public static async addQualificationDocuments( id: string, filePaths: string[] ) {
		return await db.caregivers.findByIdAndUpdate(
			id,
			{
				$push: {
					qualifications: { $each: filePaths },
				},
				isVerified: false, // Reset verification status when new documents are uploaded
			},
			{ new: true }
		);
	}

	public static async cancelAppointmentRequest( caregiverId: string, appointmentId: string ) {
		try {
			// Update appointment status
			const appointment = await db.appointments.findOneAndUpdate(
				{ _id: appointmentId, caregiver: caregiverId },
				{
					$set: {
						status: APPOINTMENT_STATUSES.CANCELLED,
						cancellationReason: 'Cancelled by caregiver'
					}
				},
				{ new: true }
			);

			if ( !appointment ) {
				throw new Error( 'Appointment not found or not assigned to this caregiver' );
			}

			// Add caregiver to cancelled list in Redis
			await CaregiverCancellationService.addCancelledCaregiver(
				appointmentId,
				caregiverId
			);

			return appointment;
		} catch ( error ) {
			console.error( 'Error cancelling appointment request:', error );
			throw error;
		}
	}

	public static async getNearestAvailableCaregivers(
		latitude: number,
		longitude: number,
		appointmentId: string,
		maxDistance: number = 10000
	) {
		try {
			// Get caregivers with active appointments
			const busyCaregiverIds = await db.appointments.distinct( 'caregiver', {
				status: {
					$in: [APPOINTMENT_STATUSES.PENDING, APPOINTMENT_STATUSES.IN_PROGRESS]
				}
			} );

			// Get cancelled caregivers for this appointment
			const cancelledCaregiverIds = await CaregiverCancellationService.getCancelledCaregivers( appointmentId );

			// Combine busy and cancelled caregiver IDs
			const excludedCaregiverIds = [...busyCaregiverIds, ...cancelledCaregiverIds];

			const currentTime = new Date();
			const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
			const dayOfWeek = days[currentTime.getDay()];
			const timeStr = currentTime.toLocaleTimeString( 'en-US', {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit'
			} );

			const availableCaregivers = await db.caregivers.aggregate( [
				{
					$geoNear: {
						near: {
							type: 'Point',
							coordinates: [longitude, latitude]
						},
						distanceField: 'distance',
						maxDistance: maxDistance,
						spherical: true
					}
				},
				{
					$match: {
						_id: { $nin: excludedCaregiverIds },
						isVerified: true,
						isActive: true,
						isBanned: false,
						[`availability.${dayOfWeek}.enabled`]: true,
						[`availability.${dayOfWeek}.start`]: { $lte: timeStr },
						[`availability.${dayOfWeek}.end`]: { $gte: timeStr }
					}
				},
				{
					$project: {
						firstName: 1,
						lastName: 1,
						phone: 1,
						email: 1,
						qualifications: 1,
						location: 1,
						imgUrl: 1,
						distance: 1
					}
				},
				{
					$sort: {
						distance: 1
					}
				}
			] );

			return availableCaregivers;
		} catch ( error ) {
			console.error( 'Error finding nearest available caregivers:', error );
			throw error;
		}
	}

	public static async updateAvailability( id: string, availability: WeeklySchedule ) {
		return await db.caregivers.findByIdAndUpdate(
			id,
			{ availability },
			{ new: true }
		);
	}

	public static async isAvailableAt( id: string, dateTime: Date ): Promise<boolean> {
		const caregiver = await this.getCaregiverById( id );
		if ( !caregiver ) return false;

		return caregiver.isAvailableAt( dateTime );
	}
}
