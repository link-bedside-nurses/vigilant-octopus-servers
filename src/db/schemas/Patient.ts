import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { DESIGNATION } from '../../interfaces';

@modelOptions({
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform(_doc, ret): void {
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
})
export class Patient {
	@prop({
		type: String,
		required: false,
		default: DESIGNATION.PATIENT,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
	})
	designation!: DESIGNATION.PATIENT;

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

	@prop({ type: Boolean, required: false, default: false })
	isPhoneVerified?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isBanned?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isVerified?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isActive?: boolean;
}
