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
				delete ret.password;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
})
export class Patient {
	@prop({
		type: String,
		required: true,
		enum: [DESIGNATION.PATIENT, DESIGNATION.NURSE, DESIGNATION.ADMIN],
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
	name!: string;

	@prop({ type: Boolean, required: false, default: false })
	isPhoneVerified?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isBanned?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isVerified?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isDeactivated?: boolean;
}
