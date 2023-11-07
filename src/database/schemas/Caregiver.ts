import { DESIGNATION } from '@/interfaces/designations'
import { modelOptions, prop, Severity } from '@typegoose/typegoose'

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
export class Caregiver {
	@prop({
		type: String,
		required: true,
		trim: true,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
	})
	designation!: DESIGNATION

	@prop({
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
	})
	phone!: string

	@prop({ type: String, required: true, minlength: 3, maxlength: 250, trim: true })
	firstName!: string

	@prop({ type: String, required: true, minlength: 3, maxlength: 250, trim: true })
	lastName!: string

	@prop({
		type: Object,
		required: false,
		default: {
			lng: 0,
			lat: 0,
		},
	})
	@prop({ type: String, required: true })
	password!: string

	@prop({
		type: Object,
		required: false,
		default: {
			place: '',
			coordinates: {
				lng: 0,
				lat: 0,
			},
		},
	})
	location?: {
		place: string
		coordinates: {
			lng: number
			lat: number
		}
	}

	@prop({ type: Boolean, required: false, default: false })
	isPhoneVerified?: boolean

	@prop({ type: Date, required: false, default: new Date() })
	dateOfBirth?: Date

	@prop({ type: String, required: false, default: '', trim: true })
	nin?: string

	@prop({ type: String, required: false, default: '', trim: true })
	medicalLicenseNumber?: string

	@prop({ type: String, required: false, default: '', trim: true })
	description?: string

	@prop({ type: Number, required: false, default: 0 })
	rating?: number

	@prop({ type: String, required: false, default: '', trim: true })
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

	@prop({ type: String, required: false, default: '', trim: true })
	imgUrl?: string

	@prop({ type: Boolean, required: false, default: false })
	isBanned!: boolean
}
