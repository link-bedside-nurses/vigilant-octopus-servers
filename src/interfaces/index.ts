export enum APPOINTMENT_STATUSES {
	PENDING = 'pending',
	ASSIGNED = 'assigned',
	CANCELLED = 'cancelled',
	IN_PROGRESS = 'In progress',
	COMPLETED = 'completed',
}
export interface ACCOUNT {
	id: string;
	phone?: string;
	email?: string;
	type: 'admin' | 'patient' | 'nurse';
	name?: string;
}
