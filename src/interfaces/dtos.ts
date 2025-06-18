import { z } from 'zod';

const BaseSchema = z.object({
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	/**
	 * +256700000000 +256300000000  256700000000 256300000000 0700000000 0300000000
	 */
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'), // E.164 format
	password: z.string().min(8),
	email: z.string().email().optional(),
});

export const CreatePatientSchema = BaseSchema.extend({
	momoNumber: z.string().optional(),
	isMomoNumberVerified: z.boolean().optional(),
	password: z.string().min(8),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAdminSchema = BaseSchema.extend({
	email: z.string().email(),
	password: z.string().min(8),
}).omit({ phone: true });

export const CreateNurseSchema = BaseSchema.extend({
	email: z.string().email(),
	password: z.string().min(8),
});

export const UpdateNurseSchema = BaseSchema.extend({
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

// New DTOs for simplified authentication flow
export const PatientPhoneAuthSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
});

export const PatientOTPVerificationSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
	otp: z.string().length(6),
	name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const AdminSigninSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const AdminSignupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const AdminOTPVerificationSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(6),
});

export const ScheduleAppointmentSchema = z.object({
	nurse: z.string(),
	symptoms: z.array(z.string()),
	date: z.coerce.date(),
	description: z.string().optional(),
	location: z.object({
		type: z.literal('Point'),
		coordinates: z.tuple([
			z.number().min(-180).max(180), // longitude
			z.number().min(-90).max(90), // latitude
		]),
	}),
});

export const RescheduleAppointmentSchema = z.object({
	date: z.string(),
});

export const CancelAppointmentSchema = z.object({
	reason: z.string().optional(),
});

export const TResponseSchema = z.object({
	statusCode: z.number(),
	body: z.object({
		data: z.object({}).nullable(),
		error: z.object({}).optional(),
		message: z.string(),
	}),
});

export const VerifyEmailSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(6),
});

export const VerifyPhoneSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'), // E.164 format,
	otp: z.string().length(6),
});

export const PhoneVerifcationOTPSchema = z.object({
	toPhone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'), // E.164 format
});

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>;
export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
export type CreateNurseDto = z.infer<typeof CreateNurseSchema>;
export type UpdateNurseDto = z.infer<typeof UpdateNurseSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;
export type ScheduleAppointmentDto = z.infer<typeof ScheduleAppointmentSchema>;
export type RescheduleAppointmentDto = z.infer<typeof RescheduleAppointmentSchema>;
export type CancelAppointmentDto = z.infer<typeof CancelAppointmentSchema>;
export type TResponse = z.infer<typeof TResponseSchema>;
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;
export type VerifyPhoneDto = z.infer<typeof VerifyPhoneSchema>;
export type PhoneVerifcationOTPDto = z.infer<typeof PhoneVerifcationOTPSchema>;

// New types for simplified authentication
export type PatientPhoneAuthDto = z.infer<typeof PatientPhoneAuthSchema>;
export type PatientOTPVerificationDto = z.infer<typeof PatientOTPVerificationSchema>;
export type AdminSigninDto = z.infer<typeof AdminSigninSchema>;
export type AdminSignupDto = z.infer<typeof AdminSignupSchema>;
export type AdminOTPVerificationDto = z.infer<typeof AdminOTPVerificationSchema>;
