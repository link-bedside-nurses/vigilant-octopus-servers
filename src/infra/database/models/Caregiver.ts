import { index, modelOptions, prop, Severity } from '@typegoose/typegoose';
import { Location } from './Location';
import { DESIGNATION } from '../../../core/interfaces';

@modelOptions({
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform(_doc, ret): void {
				delete ret.password;
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
})
@index({ title: 'text', location: '2dsphere' })
export class Caregiver {
	@prop({
		type: String,
		required: false,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
		default: DESIGNATION.CAREGIVER,
	})
	designation!: DESIGNATION;

	@prop({
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
	})
	phone!: string;

	@prop({ type: String, required: true, minlength: 2, maxlength: 250, trim: true })
	firstName!: string;

	@prop({ type: String, required: true, minlength: 2, maxlength: 250, trim: true })
	lastName!: string;

	@prop({ type: String, required: true })
	password!: string;

	@prop({ type: Array, required: true })
	qualifications!: string[];

	@prop({ type: Location, index: '2dsphere' })
	location!: Location;

	@prop({ type: Boolean, required: false, default: false })
	isPhoneVerified?: boolean;

	@prop({ type: String, required: false, default: '', trim: true })
	imgUrl?: string;

	@prop({ type: Boolean, required: false, default: false })
	isBanned?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isActive?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isVerified?: boolean;
}
