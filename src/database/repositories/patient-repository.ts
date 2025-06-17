import { db } from '..';
import { CreatePatientDto, UpdatePatientDto } from '../../interfaces/dtos';
import { APPOINTMENT_STATUSES } from '../../interfaces';

export class PatientRepo {
	public static async createPatient( patient: CreatePatientDto ) {
		return ( await db.patients.create( patient ) ).save();
	}

	public static async getPatientById( id: string ) {
		return await db.patients.findById( id );
	}

	public static async getAllPatients() {
		return await db.patients.find( {} ).sort( { createdAt: 'desc' } );
	}

	public static async getPatientByPhone( phone: string ) {
		return await db.patients.findOne( { phone } );
	}

	public static async getPatientByEmail( email: string ) {
		return await db.patients.findOne( { email } );
	}

	public static async verifyPatient( id: string ) {
		return await db.patients.findByIdAndUpdate( id, { isVerified: true }, { new: true } );
	}

	public static async banPatient( id: string ) {
		return await db.patients.findByIdAndUpdate( id, { isBanned: true }, { new: true } );
	}

	public static async deletePatient( id: string ) {
		// Cancel any pending appointments
		await db.appointments.updateMany(
			{ patient: id, status: { $in: [APPOINTMENT_STATUSES.PENDING, APPOINTMENT_STATUSES.IN_PROGRESS] } },
			{ $set: { status: APPOINTMENT_STATUSES.CANCELLED, cancellationReason: 'Patient account deleted' } }
		);

		// Delete the patient document
		return await db.patients.findByIdAndDelete( id );
	}

	public static async markPatientForDeletion( id: string ) {
		// Mark the account for deletion (to be processed within 7 days)
		return await db.patients.findByIdAndUpdate(
			id,
			{

				markedForDeletion: true,
				deletionRequestDate: new Date(),
				isActive: false // Deactivate immediately

			},
			{ new: true, }
		);
	}

	public static async deactivatePatient( id: string ) {
		return await db.patients.findByIdAndUpdate( id, { $set: { isActive: false } }, { new: true } );
	}

	public static async updatePatient( id: string, update: UpdatePatientDto ) {
		return await db.patients.findByIdAndUpdate( id, { ...update }, { new: true } );
	}
}
