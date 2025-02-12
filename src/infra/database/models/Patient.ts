import { index, modelOptions, prop, Severity } from '@typegoose/typegoose';
import { DESIGNATION } from '../../../core/interfaces';
import { Location } from './Location';

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
@index( { title: 'text', location: '2dsphere' } )
export class Patient {
	@prop( {
		type: String,
		required: false,
		default: DESIGNATION.PATIENT,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
	} )
	designation!: DESIGNATION.PATIENT;

	@prop( {
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
	} )
	phone!: string;

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	firstName!: string;

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	lastName!: string;

	@prop( { type: Boolean, required: false, default: false } )
	isPhoneVerified?: boolean;

	@prop( { type: Boolean, required: false, default: false } )
	isBanned?: boolean;

	@prop( { type: Location, index: '2dsphere' } )
	location!: Location;

	@prop( { type: Boolean, required: false, default: false } )
	isVerified?: boolean;

	@prop( { type: Boolean, required: false, default: false } )
	isActive?: boolean;

	@prop( {
		type: String,
		required: false,
		unique: true,
		trim: true,
		sparse: true // This allows multiple null values while maintaining uniqueness for non-null values
	} )
	email?: string;

	@prop( {
		type: String,
		required: false,
		trim: true,
		unique: true,
		validate: {
			validator: function ( v: string ) {
				return /^(256|0)?(7[0578])\d{7}$/.test( v );
			},
			message: props => `${props.value} is not a valid Uganda phone number!`
		},
		default: function ( this: Patient ) {
			return this.phone;
		}
	} )
	momoNumber?: string;

	@prop( { type: Boolean, required: false, default: false } )
	isMomoNumberVerified?: boolean;

	@prop( { type: String, required: true } )
	password!: string;
}
