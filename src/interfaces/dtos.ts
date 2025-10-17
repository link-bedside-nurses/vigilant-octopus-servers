import { z } from 'zod';

export const GeoJSONLocationSchema = z.object({
	type: z.literal('Point'),
	coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
});

export const CreatePatientSchema = z.object({
	name: z.string().min(2),
	phone: z.string().regex(/^(256|0)?(7[0578])\d{7}$/, 'Not a valid Uganda phone number'),
	password: z.string().min(8),
	email: z.string().email().optional(),
	isPhoneVerified: z.boolean().optional(),
});

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAdminSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const UpdateAdminSchema = CreateAdminSchema.partial();

export const CreateNurseSchema = z.object({
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	phone: z.string().regex(/^(256|0)?(7[0578])\d{7}$/, 'Not a valid Uganda phone number'),
	email: z.string().email().optional(),
	isActive: z.boolean().optional(),
	isVerified: z.boolean().optional(),
	location: GeoJSONLocationSchema.optional(),
});

export const UpdateNurseSchema = CreateNurseSchema.partial();

export const ScheduleAppointmentSchema = z.object({
	patient: z.string(),
	nurse: z.string().optional(),
	symptoms: z.array(z.string()).min(1),
	date: z.coerce.date().optional(),
	description: z.string().optional(),
	// Location is required - either as GeoJSON or raw coordinates
	location: GeoJSONLocationSchema.optional(),
	coordinates: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),
}).refine((data) => data.location || data.coordinates, {
	message: "Either location or coordinates is required",
	path: ["location"],
});

export const RescheduleAppointmentSchema = z.object({
	date: z.string(),
});

export const CancelAppointmentSchema = z.object({
	reason: z.string().optional(),
});

export const PatientPhoneAuthSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
});

export const PatientOTPVerificationSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
	otp: z.string().length(5),
	name: z.string().optional(),
});

export const AdminSigninSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const AdminSignupSchema = z.object({
	email: z.string().email(),
	firstName: z.string().min(2).optional(),
	lastName: z.string().min(2).optional(),
});

export const AdminSetPasswordSchema = z
	.object({
		token: z.string().min(32),
		password: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export const AdminOTPVerificationSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(5),
});

// Admin password reset
export const AdminPasswordResetRequestSchema = z.object({
	email: z.string().email(),
});

export const AdminPasswordResetSchema = z.object({
	email: z.string().email(),
	otp: z.string().length(5),
	newPassword: z.string().min(8),
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
	otp: z.string().length(5),
});

export const VerifyPhoneSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
	otp: z.string().length(5),
});

export const PhoneVerifcationOTPSchema = z.object({
	toPhone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
});

export const PatientSetNameSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number'),
	name: z.string().min(2).max(250),
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
export type PatientSetNameDto = z.infer<typeof PatientSetNameSchema>;

export type PatientPhoneAuthDto = z.infer<typeof PatientPhoneAuthSchema>;
export type PatientOTPVerificationDto = z.infer<typeof PatientOTPVerificationSchema>;
export type AdminSigninDto = z.infer<typeof AdminSigninSchema>;
export type AdminSignupDto = z.infer<typeof AdminSignupSchema>;
export type AdminSetPasswordDto = z.infer<typeof AdminSetPasswordSchema>;
export type AdminOTPVerificationDto = z.infer<typeof AdminOTPVerificationSchema>;
export type AdminPasswordResetRequestDto = z.infer<typeof AdminPasswordResetRequestSchema>;
export type AdminPasswordResetDto = z.infer<typeof AdminPasswordResetSchema>;

// Payment schemas
export const InitiatePaymentSchema = z.object({
	amount: z
		.number()
		.min(500, 'Amount must be at least 500 UGX')
		.max(10000000, 'Amount must not exceed 10,000,000 UGX'),
	appointmentId: z.string(),
	description: z.string().optional(),
	phoneNumber: z
		.string()
		.regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number')
		.optional(),
});

export const PaymentQuerySchema = z.object({
	status: z
		.enum(['PENDING', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'CANCELLED', 'SANDBOX'])
		.optional(),
	paymentMethod: z.enum(['MTN', 'AIRTEL']).optional(),
	patientId: z.string().optional(),
	appointmentId: z.string().optional(),
	page: z.number().int().positive().optional(),
	limit: z.number().int().positive().max(100).optional(),
});

export const WebhookPayloadSchema = z.object({
	event: z.string(),
	transaction: z.object({
		uuid: z.string(),
		reference: z.string(),
		status: z.enum(['pending', 'processing', 'successful', 'failed', 'cancelled', 'sandbox']),
		provider_reference: z.string().nullable(),
		amount: z.number(),
		currency: z.string(),
		phone_number: z.string(),
		provider: z.string(),
		type: z.enum(['collection', 'disbursement']),
	}),
	timestamp: z.string(),
});

export type InitiatePaymentDto = z.infer<typeof InitiatePaymentSchema>;
export type PaymentQueryDto = z.infer<typeof PaymentQuerySchema>;
export type WebhookPayloadDto = z.infer<typeof WebhookPayloadSchema>;

// Nurse Authentication Schemas
export const NursePhoneAuthSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid Uganda phone number'),
});

export const NurseOTPVerificationSchema = z.object({
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid Uganda phone number'),
	otp: z.string().length(5),
});

export const NurseRegistrationSchema = z.object({
	firstName: z.string().min(2, 'First name must be at least 2 characters'),
	lastName: z.string().min(2, 'Last name must be at least 2 characters'),
	phone: z.string().regex(/^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid Uganda phone number'),
	email: z.string().email().optional(),
});

export const NurseProfileUpdateSchema = z.object({
	firstName: z.string().min(2).optional(),
	lastName: z.string().min(2).optional(),
	email: z.string().email().optional(),
});

export const QualificationSchema = z.object({
	type: z.enum(['certification', 'cv', 'other']),
	title: z.string().min(2, 'Title must be at least 2 characters'),
	description: z.string().optional(),
});

export type NursePhoneAuthDto = z.infer<typeof NursePhoneAuthSchema>;
export type NurseOTPVerificationDto = z.infer<typeof NurseOTPVerificationSchema>;
export type NurseRegistrationDto = z.infer<typeof NurseRegistrationSchema>;
export type NurseProfileUpdateDto = z.infer<typeof NurseProfileUpdateSchema>;
export type QualificationDto = z.infer<typeof QualificationSchema>;
