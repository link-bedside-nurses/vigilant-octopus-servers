import { Types } from 'mongoose';

export type TUser = {
	email: string;
	firstName: string;
	lastName: string;
	designation: DESIGNATION;
	password: string;
};

export enum APPOINTMENT_STATUSES {
	PENDING = 'pending',
	CANCELLED = 'cancelled',
	IN_PROGRESS = 'In progress',
	COMPLETED = 'completed',
}

export enum DESIGNATION {
	PATIENT = 'PATIENT',
	CAREGIVER = 'CAREGIVER',
	ADMIN = 'ADMIN',
}

export interface IToken extends NonNullable<unknown> {
	id: Types.ObjectId;
	expiresIn: number;
}

export interface ACCOUNT {
	id: string;
	designation: DESIGNATION;
	phone?: string;
	email?: string;
}
