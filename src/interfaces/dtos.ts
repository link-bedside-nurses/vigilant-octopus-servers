import { DESIGNATION } from '../types';

export type BaseDto = {
	phone: string;
	designation: DESIGNATION;
};
export type DTO<T> = {
	[K in keyof T]: T[K];
} & BaseDto;

export type CreateAppointmentDto = DTO<{
	email: string;
	password: string;
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

export type UpdateCaregiverDto = DTO<{
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
}>;

export type UpdateAdminDto = DTO<{
	firstName: string;
	lastName: string;
}>;

export type CreatePatientDto = DTO<{
	name: string;
}>;
