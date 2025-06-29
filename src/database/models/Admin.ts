import { modelOptions, prop, Severity } from '@typegoose/typegoose';

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
export class Admin {
	@prop({
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
	})
	email!: string;

	@prop({ type: String, required: true })
	password!: string;

	@prop({ type: Boolean, required: false, default: false })
	isEmailVerified?: boolean;

	// Account deletion fields (Google Play Store compliance)
	@prop({ type: Boolean, required: false, default: false })
	markedForDeletion?: boolean;

	@prop({ type: Date, required: false })
	deletionRequestDate?: Date;

	@prop({ type: String, required: false })
	deletionReason?: string;

	@prop({ type: String, required: false })
	deletionRequestSource?: 'web' | 'mobile' | 'admin';

	@prop({ type: Boolean, required: false, default: false })
	deletionConfirmed?: boolean;

	@prop({ type: Date, required: false })
	deletionConfirmedDate?: Date;

	@prop({ type: String, required: false })
	deletionConfirmedBy?: string; // admin ID or 'system'
}
