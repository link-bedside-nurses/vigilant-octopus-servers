import { index, modelOptions, prop, Severity } from '@typegoose/typegoose';

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				delete ret.password;
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
@index( { title: 'text', location: '2dsphere' } )
export class Nurse {
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

	@prop( { type: String, required: false, unique: true, trim: true } )
	email?: string;

	@prop( { type: [String], required: false, default: [] } )
	qualifications!: string[];

	@prop( { type: String, required: false, default: '', trim: true } )
	imgUrl?: string;

	@prop( { type: Boolean, required: false, default: true } )
	isActive?: boolean;

	@prop( { type: Boolean, required: false, default: false } )
	isVerified?: boolean;
}
