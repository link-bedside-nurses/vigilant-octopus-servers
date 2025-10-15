import { index, modelOptions, prop, Severity } from '@typegoose/typegoose';

// Document interface for Disk storage with streaming
export interface DiskDocument {
    publicId: string;
	url: string;
	filename: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    originalName: string;
    hash?: string;
}

// National ID interface
export interface NationalID {
    front: DiskDocument;
    back: DiskDocument;
}

// Qualification document interface
export interface QualificationDocument {
    id: string;
    type: 'certification' | 'cv' | 'other';
    document: DiskDocument;
    title: string;
    description?: string;
    uploadedAt: Date;
}

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
export class Nurse {
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

	@prop({ type: String, required: false, unique: true, trim: true })
	email?: string;

	@prop({ type: Boolean, required: false, default: true })
	isActive?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	isVerified?: boolean;

	// Profile picture (passport photo)
	@prop({ type: Object, required: false })
	profilePicture?: DiskDocument;

	// National ID documents
	@prop({ type: Object, required: false })
	nationalId?: NationalID;

	// Qualification documents
	@prop({ type: [Object], required: false, default: [] })
	qualifications: QualificationDocument[] = [];

	// Document verification status
	@prop({
		type: String,
		required: false,
		default: 'pending',
		enum: ['pending', 'verified', 'rejected'],
	})
	documentVerificationStatus?: string;

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
