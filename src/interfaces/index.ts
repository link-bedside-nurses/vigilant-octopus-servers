import { Types } from 'mongoose';

export type TUser = {
	email: string;
	firstName: string;
	lastName: string;
	password: string;
};

export enum APPOINTMENT_STATUSES {
	PENDING = 'pending',
	ASSIGNED = 'assigned',
	CANCELLED = 'cancelled',
	IN_PROGRESS = 'In progress',
	COMPLETED = 'completed',
}

export interface IToken extends NonNullable<unknown> {
	id: Types.ObjectId;
	expiresIn: number;
}

export interface ACCOUNT {
	id: string;
	phone?: string;
	email?: string;
}
