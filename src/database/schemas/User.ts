import { modelOptions, pre, prop, Severity } from '@typegoose/typegoose'
import phoneRegex from '@/constants/phone-regex'
import { Location } from '@/database/schemas/Location'
import { Password } from '@/services/password/password'

export enum DESIGNATION {
	PATIENT = 'PATIENT',
	CAREGIVER = 'CAREGIVER',
	ADMIN = 'ADMIN',
}

@modelOptions({
	schemaOptions: {
		id: true,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform(_doc, ret): void {
				delete ret.password
				delete ret.__v
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
})
@pre<User>('save', async function (next) {
	if (!this.isModified('password') && this.password) next()
	this.password = await Password.toHash(User.prototype.password!)
})
export class User {
	@prop({
		type: String,
		required: true,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
	})
	designation!: DESIGNATION

	@prop({
		type: String,
		required: true,
		unique: true,
		validate: {
			validator: function (v: string) {
				return phoneRegex.test(v)
			},
			message: 'Invalid Phone Format!',
		},
	})
	phone!: string

	@prop({ type: String, required: true, minlength: 3, maxlength: 250 })
	firstName!: string

	@prop({ type: String, required: true, minlength: 3, maxlength: 250 })
	lastName!: string

	@prop({
		type: Location,
		required: false,
		ref: 'Location',
		default: {
			lng: 0,
			lat: 0,
		},
	})
	location?: { lng: number; lat: number }

	@prop({ type: String, required: false, default: '00000' })
	otp?: string

	@prop({ type: String, required: false })
	password?: string

	@prop({ type: Date, required: false, default: Date.now() })
	otpExpiresAt?: Date

	@prop({ type: Date })
	dateOfBirth?: Date

	@prop({ type: String, required: false, default: '' })
	nin?: string

	@prop({ type: String, required: false, default: '' })
	medicalLicenseNumber?: string

	@prop({ type: String, required: false, default: '' })
	description?: string

	@prop({ type: Number, required: false, default: 1 })
	rating?: number

	@prop({ type: String, required: false, default: '' })
	placeOfReception?: string

	@prop({ type: () => [String], required: false, default: [] })
	speciality?: string[]

	@prop({ type: () => [String], required: false, default: [] })
	languages?: string[]

	@prop({ type: () => [String], required: false, default: [] })
	affiliations?: string[]

	@prop({ type: Number, required: false, default: 0 })
	experience?: number

	@prop({ type: () => [String], required: false, default: [] })
	servicesOffered?: string[]

	@prop({ type: String, required: false, default: '' })
	imageUrl?: string

	@prop({ type: String, required: false, default: '' })
	imgUrl?: string
}
