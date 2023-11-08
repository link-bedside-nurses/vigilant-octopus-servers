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
export class Admin {
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

	@prop({ type: Boolean, required: false, default: false })
	isBanned!: boolean

	@prop({ type: Boolean, required: false, default: false })
	isPhoneVerified?: boolean
}