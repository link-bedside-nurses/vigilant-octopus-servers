import { z } from 'zod';
import { APPOINTMENT_STATUSES, DESIGNATION } from '.';

const DesignationEnum = z.enum(Object.values(DESIGNATION) as [string, ...string[]]);
const AppointmentStatusEnum = z.enum(Object.values(APPOINTMENT_STATUSES) as [string, ...string[]]);

const BaseSchema = z.object({
	/**
	 * This pattern will now allow phone numbers in these formats:
	 * +256700000000
	 * +256300000000
	 * 256700000000
	 * 256300000000
	 * 0700000000
	 * 0300000000
	 */
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/), // E.164 format
	designation: DesignationEnum,
});

export const CreatePatientSchema = BaseSchema.extend({
	name: z.string().min(2),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAdminSchema = BaseSchema.extend({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
});

export const CreateCaregiverSchema = BaseSchema.extend({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(8),
});

export const UpdateCaregiverSchema = BaseSchema.extend({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	dateOfBirth: z.string().optional(),
	nin: z.string().optional(),
	experience: z.string().optional(),
	description: z.string().optional(),
	location: z
		.object({
			lng: z.number(),
			lat: z.number(),
		})
		.optional(),
	imageUrl: z.string().url().optional(),
}).partial();

export const UpdateAdminSchema = BaseSchema.extend({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
}).partial();

export const CreateRatingSchema = z.object({
	patientId: z.string(),
	caregiverId: z.string(),
	review: z.string(),
	value: z.number().min(1).max(5),
});

export const ScheduleAppointmentSchema = z.object({
	caregiverId: z.string(),
	status: AppointmentStatusEnum,
	reason: z.string(),
	date: z.string().optional(),
});

export const CancelAppointmentSchema = ScheduleAppointmentSchema.pick({ reason: true });

export const TResponseSchema = z.object({
	statusCode: z.number(),
	body: z.object({
		data: z.object({}).nullable(),
		message: z.string(),
	}),
});

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>;
export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
export type CreateCaregiverDto = z.infer<typeof CreateCaregiverSchema>;
export type UpdateCaregiverDto = z.infer<typeof UpdateCaregiverSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;
export type CreateRatingDto = z.infer<typeof CreateRatingSchema>;
export type ScheduleAppointmentDto = z.infer<typeof ScheduleAppointmentSchema>;
export type CancelAppointmentDto = z.infer<typeof CancelAppointmentSchema>;
export type TResponse = z.infer<typeof TResponseSchema>;
