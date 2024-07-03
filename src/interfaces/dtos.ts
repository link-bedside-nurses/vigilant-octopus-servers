import { APPOINTMENT_STATUSES } from '.';
import { DESIGNATION } from '../types';

export type BaseDto = {
	phone: string;
	designation: DESIGNATION;
};

export type DTO<T> = {
	[K in keyof T]: T[K];
} & BaseDto;

export type CreatePatientDto = DTO<{
	name: string;
}>;

export type CreateAdminDto = DTO<{
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}>;

export type CreateCaregiverDto = DTO<{
	firstName: string;
	lastName: string;
	email: string;
	password: string;
}>;

export type UpdateCaregiverDto = Partial<
	DTO<{
		phone: string;
		firstName: string;
		lastName: string;
		dateOfBirth: string;
		nin: string;
		experience: string;
		description: string;
		location: {
			lng: number;
			lat: number;
		};
		imageUrl: string;
	}>
>;

export type UpdateAdminDto = Partial<
	DTO<{
		firstName: string;
		lastName: string;
		phone: string;
	}>
>;

export type CreateRatingDto = {
	patientId: string;
	caregiverId: string;
	review: string;
	value: number;
};

export type ScheduleAppointmentDto = {
	caregiverId: string;
	status: APPOINTMENT_STATUSES;
	reason: string;
	date?: string;
};

export type CancelAppointmentDto = Pick<ScheduleAppointmentDto, 'reason'>;
