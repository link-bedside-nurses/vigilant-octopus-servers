import { z } from 'zod';
import { DESIGNATION } from '.';

const DesignationEnum = z.enum( Object.values( DESIGNATION ) as [string, ...string[]] );

const BaseSchema = z.object( {
	firstName: z.string().min( 1 ),
	lastName: z.string().min( 1 ),
	/**
	 * +256700000000 +256300000000  256700000000 256300000000 0700000000 0300000000
	 */
	phone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ), // E.164 format
	designation: DesignationEnum,
	password: z.string().min( 8 ),
	confirmPassword: z.string().min( 8 ),
	email: z.string().email(),
} );

export const CreatePatientSchema = BaseSchema.extend( {
	momoNumber: z.string().optional(),
	isMomoNumberVerified: z.boolean().optional(),
} ).omit( { designation: true } );

export const UpdatePatientSchema = CreatePatientSchema.partial();

export const CreateAdminSchema = BaseSchema.extend( {
	email: z.string().email(),
	password: z.string().min( 8 ),
} ).omit( { designation: true, phone: true } );

export const CreateCaregiverSchema = BaseSchema.extend( {
	email: z.string().email(),
	password: z.string().min( 8 ),
} ).omit( { designation: true } );

export const UpdateCaregiverSchema = BaseSchema.extend( {
	dateOfBirth: z.string().optional(),
	nin: z.string().optional(),
	experience: z.string().optional(),
	description: z.string().optional(),
	location: z
		.object( {
			lng: z.number(),
			lat: z.number(),
		} )
		.optional(),
	imageUrl: z.string().url().optional(),
} ).partial();

export const UpdateAdminSchema = BaseSchema.extend( {
	email: z.string().email(),
} ).partial();

export const CreateRatingSchema = z.object( {
	caregiver: z.string(),
	review: z.string(),
	value: z.number().min( 1 ).max( 5 ),
} );

export const ScheduleAppointmentSchema = z.object( {
	caregiver: z.string(),
	symptoms: z.array( z.string() ).min( 1 ),
	date: z.string().optional(),
} );

export const RescheduleAppointmentSchema = z.object( {
	date: z.string(),
} );

export const CancelAppointmentSchema = z.object( {
	reason: z.string().optional(),
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
	otp: z.string().length( 6 ),
} );

export const VerifyPhoneSchema = z.object( {
	phone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ), // E.164 format,
	otp: z.string().length( 6 ),
	designation: DesignationEnum,
} );

export const PhoneVerifcationOTPSchema = z.object( {
	designation: DesignationEnum,
	toPhone: z.string().regex( /^(\+256|256|0)([37][0-9]{8})$/, 'Not a valid ug phone number' ), // E.164 format
} );

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientDto = z.infer<typeof UpdatePatientSchema>;
export type CreateAdminDto = z.infer<typeof CreateAdminSchema>;
export type CreateCaregiverDto = z.infer<typeof CreateCaregiverSchema>;
export type UpdateCaregiverDto = z.infer<typeof UpdateCaregiverSchema>;
export type UpdateAdminDto = z.infer<typeof UpdateAdminSchema>;
export type CreateRatingDto = z.infer<typeof CreateRatingSchema>;
export type ScheduleAppointmentDto = z.infer<typeof ScheduleAppointmentSchema>;
export type RescheduleAppointmentDto = z.infer<typeof RescheduleAppointmentSchema>;
export type CancelAppointmentDto = z.infer<typeof CancelAppointmentSchema>;
export type TResponse = z.infer<typeof TResponseSchema>;
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>;
export type VerifyPhoneDto = z.infer<typeof VerifyPhoneSchema>;
export type PhoneVerifcationOTPDto = z.infer<typeof PhoneVerifcationOTPSchema>;
