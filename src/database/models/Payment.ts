import { modelOptions, mongoose, prop, Ref, Severity } from '@typegoose/typegoose';
import { Appointment } from './Appointment';
import { Patient } from './Patient';

export enum PaymentStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	SUCCESSFUL = 'SUCCESSFUL',
	FAILED = 'FAILED',
	CANCELLED = 'CANCELLED',
	SANDBOX = 'SANDBOX',
}

export enum MobileProvider {
	MTN = 'MTN',
	AIRTEL = 'AIRTEL',
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
export class Payment {
	@prop({
		required: true,
		type: mongoose.Types.ObjectId,
		ref: () => Appointment,
	})
	appointment!: Ref<Appointment>;

	@prop({ ref: () => Patient, required: true })
	patient!: Ref<Patient>;

	@prop({ required: true })
	amount!: number;

	@prop()
	amountFormatted?: string;

	@prop({ default: 'UGX' })
	currency?: string;

	@prop({ required: true, unique: true })
	reference!: string;

	@prop()
	externalUuid?: string;

	@prop()
	providerReference?: string;

	@prop({
		required: true,
		enum: Object.values(PaymentStatus),
		default: PaymentStatus.PENDING,
	})
	status!: PaymentStatus;

	@prop({
		required: true,
		enum: Object.values(MobileProvider),
	})
	paymentMethod!: MobileProvider;

	@prop()
	transactionId?: string;

	@prop()
	phoneNumber?: string;

	@prop()
	failureReason?: string;

	@prop({ type: String })
	description?: string;

	@prop()
	callbackUrl?: string;

	@prop({ default: 'UG' })
	country?: string;

	@prop({ default: 'live' })
	mode?: string;

	@prop()
	initiatedAt?: Date;

	@prop()
	estimatedSettlement?: Date;

	@prop()
	completedAt?: Date;

	@prop({ type: mongoose.Schema.Types.Mixed })
	apiResponse?: any;

	@prop({ type: mongoose.Schema.Types.Mixed })
	webhookData?: any;

	@prop({ default: 0 })
	webhookAttempts?: number;
}
