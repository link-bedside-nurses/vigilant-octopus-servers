import { db } from '../../../db';
import { CreateCaregiverDto, UpdateCaregiverDto } from '../../../interfaces/dtos';

export class CaregiverRepo {
	public static async getCaregiverById(id: string) {
		return await db.caregivers.findById(id);
	}

	public static async getAllCaregivers() {
		return await db.caregivers.find({}).sort({ createdAt: 'desc' });
	}

	public static async getAllCaregiversByCoords(latLng: string) {
		const latitude = latLng?.split(',')[0];
		const longitude = latLng?.split(',')[1];

		if (!latitude || !longitude) {
			throw new Error("Missing either latitude or longitude on the 'latLng' query key");
		}
		return await db.caregivers.find({
			location: {
				$near: {
					$geometry: {
						type: 'Point',
						coordinates: [longitude, latitude],
					},
				},
			},
		});
	}

	public static async getCaregiverByPhone(phone: string) {
		return await db.caregivers.findOne({ phone });
	}

	public static async createCaregiver(caregiver: CreateCaregiverDto) {
		return await db.caregivers.create(caregiver);
	}

	public static async deleteCaregiver(id: string) {
		return await db.caregivers.findByIdAndDelete(id);
	}

	public static async deactivateCaregiver(id: string) {
		return await db.caregivers.findByIdAndUpdate(id, { $set: { isActive: true } }, { new: true });
	}

	public static async findByIdAndUpdate(id: string, caregiver: UpdateCaregiverDto) {
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

	public static async verifyCaregiver(id: string) {
		return await db.caregivers.findByIdAndUpdate(
			id,
			{ isVerified: true, isActive: true },
			{ new: true }
		);
	}

	public static async banCaregiver(id: string) {
		return await db.caregivers.findByIdAndUpdate(id, { isBanned: true }, { new: true });
	}
}
