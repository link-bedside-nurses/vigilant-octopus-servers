import { z } from 'zod';

export const GeoJSONLocationSchema = z.object( {
	type: z.literal( 'Point' ),
	coordinates: z.tuple( [z.number().min( -180 ).max( 180 ), z.number().min( -90 ).max( 90 )] ),
} );

export const CreatePatientSchema = z.object( {
	name: z.string().min( 2 ),
	phone: z.string().regex( /^(256|0)?(7[0578])\d{7}$/, 'Not a valid Uganda phone number' ),
	password: z.string().min( 8 ),
	email: z.string().email().optional(),
	location: GeoJSONLocationSchema.optional(),
} );

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAdminSchema = z.object( {
	email: z.string().email(),
	password: z.string().min( 8 ),
} );

export const UpdateAdminSchema = CreateAdminSchema.partial();

export const CreateNurseSchema = z.object( {
	firstName: z.string().min( 2 ),
	lastName: z.string().min( 2 ),
	phone: z.string().regex( /^(256|0)?(7[0578])\d{7}$/, 'Not a valid Uganda phone number' ),
	email: z.string().email().optional(),
	isActive: z.boolean().optional(),
	isVerified: z.boolean().optional(),
	location: GeoJSONLocationSchema.optional(),
} );

export const UpdateNurseSchema = CreateNurseSchema.partial();

export const ScheduleAppointmentSchema = z.object( {
	patient: z.string(),
	nurse: z.string().optional(),
	symptoms: z.array( z.string() ).min( 1 ),
	date: z.coerce.date().optional(),
	description: z.string().optional(),
} );

export const RescheduleAppointmentSchema = z.object( {
	date: z.string(),
} );

export const CancelAppointmentSchema = z.object( {
	reason: z.string().optional(),
} );

export const PatientPhoneAuthSchema = z.object( {
	phone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ),
} );

export const PatientOTPVerificationSchema = z.object( {
	phone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ),
	otp: z.string().length( 5 ),
	name: z.string().optional(),
} );

export const AdminSigninSchema = z.object( {
	email: z.string().email(),
	password: z.string().min( 8 ),
} );

export const AdminSignupSchema = z.object( {
	email: z.string().email(),
	password: z.string().min( 8 ),
} );

export const AdminOTPVerificationSchema = z.object( {
	email: z.string().email(),
	otp: z.string().length( 5 ),
} );

export const TResponseSchema = z.object( {
	statusCode: z.number(),
	body: z.object( {
		data: z.object( {} ).nullable(),
		error: z.object( {} ).optional(),
		message: z.string(),
	} ),
} );

export const VerifyEmailSchema = z.object( {
	email: z.string().email(),
	otp: z.string().length( 5 ),
} );

export const VerifyPhoneSchema = z.object( {
	phone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ),
	otp: z.string().length( 5 ),
} );

export const PhoneVerifcationOTPSchema = z.object( {
	toPhone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ),
} );

export const PatientSetNameSchema = z.object( {
	phone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ),
	name: z.string().min( 2 ).max( 250 ),
} );

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
export type AdminOTPVerificationDto = z.infer<typeof AdminOTPVerificationSchema>;

// Patient legacy phone+password auth schemas
export const PatientSigninSchema = z.object( {
	phone: z.string().regex( /^(256|0)?(7[0578])\d{7}$/, 'Not a valid Uganda phone number' ),
	password: z.string().min( 8 ),
} );

export const PatientSignupSchema = z.object( {
	name: z.string().min( 2 ),
	phone: z.string().regex( /^(256|0)?(7[0578])\d{7}$/, 'Not a valid Uganda phone number' ),
	password: z.string().min( 8 ),
} );

export type PatientSigninDto = z.infer<typeof PatientSigninSchema>;
export type PatientSignupDto = z.infer<typeof PatientSignupSchema>;
