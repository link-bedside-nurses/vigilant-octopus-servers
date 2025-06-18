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
				return coords.length === 2 &&
					coords[0] >= -180 && coords[0] <= 180 && // longitude
					coords[1] >= -90 && coords[1] <= 90;     // latitude
			},
			message: 'Invalid coordinates'
		}
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
			message: props => `${props.value} is not a valid Uganda phone number!`
		},
		default: function ( this: Patient ) {
			return this.phone;
		}
	} )
	phone!: string;

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	name!: string;

	@prop( { type: Boolean, required: false, default: false } )
	isPhoneVerified?: boolean;

	@prop( { type: Location, index: '2dsphere' } )
	location!: Location;

	@prop( { type: Boolean, required: false, default: false } )
	isVerified?: boolean;

	// New fields to support account deletion feature
	@prop( { type: Boolean, required: false, default: false } )
	markedForDeletion?: boolean;

	@prop( { type: Date, required: false } )
	deletionRequestDate?: Date;

	// Helper virtual to determine if deletion grace period has expired (7 days)
	public get isDeletionGracePeriodExpired(): boolean {
		if ( !this.markedForDeletion || !this.deletionRequestDate ) {
			return false;
		}

		const gracePeriodInDays = 7;
		const gracePeriodInMs = gracePeriodInDays * 24 * 60 * 60 * 1000;
		const currentDate = new Date();

		return ( currentDate.getTime() - this.deletionRequestDate.getTime() ) >= gracePeriodInMs;
	}
}
