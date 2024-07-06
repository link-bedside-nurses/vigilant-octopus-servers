import { z } from 'zod';
import { DESIGNATION } from '.';

const DesignationEnum = z.enum(Object.values(DESIGNATION) as [string, ...string[]]);

const BaseSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	/**
	 * +256700000000 +256300000000  256700000000 256300000000 0700000000 0300000000
	 */
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Invalid UG NO format'), // E.164 format
	designation: DesignationEnum,
});

export const CreatePatientSchema = BaseSchema.extend({}).omit({ designation: true });

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAdminSchema = BaseSchema.extend({
	email: z.string().email(),
	password: z.string().min(8),
}).omit({ designation: true, phone: true });

export const CreateCaregiverSchema = BaseSchema.extend({
	email: z.string().email(),
	password: z.string().min(8),
}).omit({ designation: true });

export const UpdateCaregiverSchema = BaseSchema.extend({
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
	email: z.string().email(),
}).partial();

export const CreateRatingSchema = z.object({
	caregiverId: z.string(),
	review: z.string(),
	value: z.number().min(1).max(5),
});

export const ScheduleAppointmentSchema = z.object({
	caregiverId: z.string(),
	reason: z.string(),
	date: z.string().optional(),
});

export const CancelAppointmentSchema = ScheduleAppointmentSchema.pick({ reason: true });

export const TResponseSchema = z.object({
	statusCode: z.number(),
	body: z.object({
		data: z.object({}).nullable(),
		error: z.object({}).optional(),
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
