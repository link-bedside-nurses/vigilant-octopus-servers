import { db } from '..';
import { CreateRatingDto } from '../../../core/interfaces/dtos';

export class RatingRepo {
	public static async createRating(patientId: string, rating: CreateRatingDto) {
		const result = await (
			await (await db.ratings.create({ ...rating, patient: patientId })).populate('patient')
		).populate('caregiver');

		return await result.save();
	}

	public static async getAllRatings() {
		return await db.ratings
			.find({})
			.sort({ createdAt: 'desc' })
			.populate('caregiver')
			.populate('patient');
	}

	public static async getCaregiverRatings(caregiverId: string) {
		return await db.ratings
			.find({
				caregiver: {
					_id: caregiverId,
				},
			})
			.populate('patient')
			.populate('caregiver');
	}

	public static async getRatingById(id: string) {
		return await db.ratings.findById(id).populate('caregiver').populate('patient');
	}

	public static async deleteRating(id: string) {
		return await db.ratings.findByIdAndDelete(id);
	}
}
