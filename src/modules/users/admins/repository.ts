import { db } from '../../../db';
import { CreateAdminDto, UpdateAdminDto } from '../../../interfaces/dtos';

export class AdminRepo {
	public static async createAdmin(admin: CreateAdminDto) {
		return (await db.admins.create(admin)).save();
	}

	public static async getAdminById(id: string) {
		return await db.admins.findById(id);
	}

	public static async getAdminByEmail(email: string) {
		return await db.admins.findOne({ email });
	}

	public static async getAdminByPhone(phone: string) {
		return await db.admins.findOne({ phone });
	}

	public static async getAllAdmins() {
		return await db.admins.find({}).sort({ createdAt: 'desc' });
	}

	public static async banAdmin(id: string) {
		return await db.admins.findByIdAndUpdate(id, { $set: { isBanned: true } }, { new: true });
	}

	public static async updateAdmin(id: string, updated: UpdateAdminDto) {
		return await db.admins.findByIdAndUpdate(id, { ...updated }, { new: true });
	}
}
