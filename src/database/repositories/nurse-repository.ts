import { db } from '..';
import { CreateNurseDto, UpdateNurseDto } from '../../interfaces/dtos';
import { APPOINTMENT_STATUSES } from '../../interfaces';
import { NurseCancellationService } from '../../services/nurse-cancellation';

export class NurseRepo {
	public static async getNurseById( id: string ) {
		return await db.nurses.findById( id );
	}

	public static async getAllNurses() {
		return await db.nurses.find( {} ).sort( { createdAt: 'desc' } );
	}

	public static async getAllNursesByCoords( latLng: string ) {
		console.log( 'latLng', latLng );
		const latitude = latLng?.split( ',' )[0];
		const longitude = latLng?.split( ',' )[1];

		if ( !latitude || !longitude ) {
			throw new Error( "Missing either latitude or longitude on the 'latLng' query key" );
		}
		return await db.nurses.find( {
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

	public static async getNurseByPhone( phone: string ) {
		return await db.nurses.findOne( { phone } );
	}

	public static async getNurseByEmail( email: string ) {
		return await db.nurses.findOne( { email } );
	}

	public static async createNurse( nurse: CreateNurseDto ) {
		return ( await db.nurses.create( nurse ) ).save();
	}

	public static async deleteNurse( id: string ) {
		// Cancel any pending appointments
		await db.appointments.updateMany(
			{ nurse: id, status: APPOINTMENT_STATUSES.PENDING },
			{ $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Nurse account deleted' } }
		);

		// Remove nurse from any in-progress appointments
		await db.appointments.updateMany(
			{ nurse: id, status: APPOINTMENT_STATUSES.IN_PROGRESS },
			{ $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Nurse account deleted' } }
		);

		// Delete the nurse document
		return await db.nurses.findByIdAndDelete( id );
	}

	public static async markNurseForDeletion( id: string ) {
		// Mark the account for deletion (to be processed within 7 days)
		return await db.nurses.findByIdAndUpdate(
			id,
			{
				markedForDeletion: true,
				deletionRequestDate: new Date(),
				isActive: false // Deactivate immediately
			},
			{ new: true }
		);
	}

	public static async deactivateNurse( id: string ) {
		return await db.nurses.findByIdAndUpdate( id, { $set: { isActive: false } }, { new: true } );
	}
	public static async findByIdAndUpdate( id: string, nurse: UpdateNurseDto ) {
		return await db.nurses.findByIdAndUpdate(
			id,
			{
				phone: nurse.phone,
				firstName: nurse.firstName,
				lastName: nurse.lastName,
				dateOfBirth: nurse.dateOfBirth,
				nin: nurse.nin,
				experience: nurse.experience,
				description: nurse.description,
				location: nurse.location,
				imageUrl: nurse.imageUrl,
			},
			{ new: true }
		);
	}

	public static async verifyNurse( id: string ) {
		return await db.nurses.findByIdAndUpdate(
			id,
			{ isVerified: true, isActive: true },
			{ new: true }
		);
	}

	public static async banNurse( id: string ) {
		return await db.nurses.findByIdAndUpdate( id, { isBanned: true }, { new: true } );
	}

	public static async addQualificationDocuments( id: string, filePaths: string[] ) {
		return await db.nurses.findByIdAndUpdate(
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

	public static async cancelAppointmentRequest( nurseId: string, appointmentId: string ) {
		try {
			// Update appointment status
			const appointment = await db.appointments.findOneAndUpdate(
				{ _id: appointmentId, nurse: nurseId },
				{
					$set: {
						status: APPOINTMENT_STATUSES.CANCELLED,
						cancellationReason: 'Cancelled by nurse'
					}
				},
				{ new: true }
			);

			if ( !appointment ) {
				throw new Error( 'Appointment not found or not assigned to this nurse' );
			}

			// Add nurse to cancelled list in Redis
			await NurseCancellationService.addCancelledNurse(
				appointmentId,
				nurseId
			);

			return appointment;
		} catch ( error ) {
			console.error( 'Error cancelling appointment request:', error );
			throw error;
		}
	}

	public static async getNearestAvailableNurses(
		latitude: number,
		longitude: number,
		appointmentId: string,
		maxDistance: number = 10000
	) {
		try {
			// Get nurses with active appointments
			const busyNurseIds = await db.appointments.distinct( 'nurse', {
				status: {
					$in: [APPOINTMENT_STATUSES.PENDING, APPOINTMENT_STATUSES.IN_PROGRESS]
				}
			} );

			// Get cancelled nurses for this appointment
			const cancelledNurseIds = await NurseCancellationService.getCancelledNurses( appointmentId );

			// Combine busy and cancelled nurse IDs
			const excludedNurseIds = [...busyNurseIds, ...cancelledNurseIds];

			const currentTime = new Date();
			const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
			const dayOfWeek = days[currentTime.getDay()];
			const timeStr = currentTime.toLocaleTimeString( 'en-US', {
				hour12: false,
				hour: '2-digit',
				minute: '2-digit'
			} );

			const availableNurses = await db.nurses.aggregate( [
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
						_id: { $nin: excludedNurseIds },
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

			return availableNurses;
		} catch ( error ) {
			console.error( 'Error finding nearest available nurses:', error );
			throw error;
		}
	}
}
