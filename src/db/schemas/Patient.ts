import { DESIGNATION } from '../../interfaces/designations'
import { modelOptions, index, prop, Severity } from '@typegoose/typegoose'
import { Location } from "./Location"

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				delete ret.password
				delete ret.__v
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
@index( { title: 'text', location: '2dsphere' } )
export class Patient {
	@prop( {
		type: String,
		required: true,
		enum: [DESIGNATION.PATIENT, DESIGNATION.NURSE, DESIGNATION.ADMIN],
	} )
	designation!: DESIGNATION.PATIENT

	@prop( {
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true
	} )
	phone!: string

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	firstName!: string

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	lastName!: string

	@prop( {
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
		default: ""
	} )
	email!: string

	@prop( { type: String, required: true, default: new Date().toISOString() } )
	dob!: string

	@prop( { type: Location, index: '2dsphere' } )
	location!: Location

	@prop( { type: Boolean, required: false, default: false } )
	isPhoneVerified?: boolean

	@prop( { type: Boolean, required: false, default: false } )
	isBanned?: boolean

	@prop( { type: Boolean, required: false, default: false } )
	isVerified?: boolean

	@prop( { type: Boolean, required: false, default: false } )
	isDeactivated?: boolean
}
