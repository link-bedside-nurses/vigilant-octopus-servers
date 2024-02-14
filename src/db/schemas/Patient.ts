import { DESIGNATION } from '@/interfaces/designations'
import { modelOptions, prop, Severity } from '@typegoose/typegoose'


@modelOptions( { schemaOptions: { _id: false, versionKey: false } } )
class Coordinates {
	@prop( { type: Number } )
	lat!: number

	@prop( { type: Number } )
	lng!: number
}


@modelOptions( { schemaOptions: { _id: false, versionKey: false }, options: { allowMixed: Severity.ALLOW } } )
class Location {
	@prop( { type: () => Coordinates } )
	coords!: Coordinates

	@prop( { type: String, default: 'Point', enum: ['Point'] } )
	type?: string

	@prop( { type: [Number] } )
	coordinates!: number[]
}

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
export class Patient {
	@prop( {
		type: String,
		required: true,
		enum: [DESIGNATION.PATIENT, DESIGNATION.NURSE, DESIGNATION.ADMIN],
	} )
	designation!: DESIGNATION

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


	@prop( { type: () => Location, index: '2dsphere' } )
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
