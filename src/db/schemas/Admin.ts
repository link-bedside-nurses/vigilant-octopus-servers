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
export class Admin {
	@prop({
		type: String,
		required: false,
		default: DESIGNATION.ADMIN,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
	})
	designation!: DESIGNATION;

	@prop({
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
	})
	email!: string;

	@prop({ type: String, required: true, minlength: 2, maxlength: 250, trim: true })
	firstName!: string;

	@prop({ type: String, required: true, minlength: 2, maxlength: 250, trim: true })
	lastName!: string;

	@prop({
		type: Object,
		required: false,
		default: {
			lng: 0,
			lat: 0,
		},
	})
	@prop({ type: String, required: true })
	password!: string;

	@prop({ type: Boolean, required: false, default: false })
	isBanned!: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isEmailVerified?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isDeactivated?: boolean;
}
