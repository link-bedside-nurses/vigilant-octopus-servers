import { index, modelOptions, prop, Severity } from '@typegoose/typegoose';

@modelOptions( {
	schemaOptions: { _id: false, versionKey: false },
	options: { allowMixed: Severity.ALLOW },
} )
export class Location {
	@prop( { type: String, default: 'Point', enum: ['Point'] } )
	type?: string;

	@prop( {
		type: [Number],
		validate: {
			validator: function ( coords: number[] ) {
				return (
					coords.length === 2 &&
					coords[0] >= -180 &&
					coords[0] <= 180 && // longitude
					coords[1] >= -90 &&
					coords[1] <= 90
				); // latitude
			},
			message: 'Invalid coordinates',
		},
	} )
	coordinates!: number[];
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
		required: true,
		unique: true,
		index: true,
		trim: true,
		validate: {
			validator: function ( v: string ) {
				return /^(256|0)?(7[0578])\d{7}$/.test( v );
			},
			message: ( props ) => `${props.value} is not a valid Uganda phone number!`,
		},
		default: function ( this: Patient ) {
			return this.phone;
		},
	} )
	phone!: string;

	@prop( { type: String, required: false, minlength: 2, maxlength: 250, trim: true } )
	name?: string;

	@prop( { type: Boolean, required: false, default: false } )
	isPhoneVerified?: boolean;

	@prop( { type: Location, required: false, index: '2dsphere' } )
	location?: Location;

	// Account deletion fields (Google Play Store compliance)
	@prop( { type: Boolean, required: false, default: false } )
	markedForDeletion?: boolean;

	@prop( { type: Date, required: false } )
	deletionRequestDate?: Date;

	@prop( { type: String, required: false } )
	deletionReason?: string;

	@prop( { type: String, required: false } )
	deletionRequestSource?: 'web' | 'mobile' | 'admin';

	@prop( { type: Boolean, required: false, default: false } )
	deletionConfirmed?: boolean;

	@prop( { type: Date, required: false } )
	deletionConfirmedDate?: Date;

	@prop( { type: String, required: false } )
	deletionConfirmedBy?: string; // admin ID or 'system'
}
