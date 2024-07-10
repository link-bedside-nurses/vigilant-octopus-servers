import { db } from '..';
import { CreatePatientDto, UpdatePatientDto } from '../../../core/interfaces/dtos';

export class PatientRepo {
	public static async createPatient(patient: CreatePatientDto) {
		return (await db.patients.create(patient)).save();
	}

	public static async getPatientById(id: string) {
		return await db.patients.findById(id);
	}

	public static async getAllPatients() {
		return await db.patients.find({}).sort({ createdAt: 'desc' });
	}

	public static async getPatientByPhone(phone: string) {
		return await db.patients.findOne({ phone });
	}

	public static async verifyPatient(id: string) {
		return await db.patients.findByIdAndUpdate(id, { isVerified: true }, { new: true });
	}

	public static async banPatient(id: string) {
		return await db.patients.findByIdAndUpdate(id, { isBanned: true }, { new: true });
	}

	public static async deletePatient(id: string) {
		return await db.patients.findByIdAndDelete(id);
	}

	public static async deactivatePatient(id: string) {
		return await db.patients.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true });
	}

	public static async updatePatient(id: string, update: UpdatePatientDto) {
		return await db.patients.findByIdAndUpdate(id, { ...update }, { new: true });
	}
}
