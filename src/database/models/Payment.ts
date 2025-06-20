import { modelOptions, mongoose, prop, Ref, Severity } from '@typegoose/typegoose';
import { Appointment } from './Appointment';
import { Patient } from './Patient';

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
		type: mongoose.Document,
		ref: Appointment,
	})
	appointment!: Appointment;

	@prop({ ref: () => Patient, required: true })
	patient!: Ref<Patient>;

	@prop({ required: true })
	amount!: number;

	@prop({ required: true })
	referenceId!: string;

	@prop({ required: true, enum: ['PENDING', 'SUCCESSFUL', 'FAILED'] })
	status!: string;

	@prop({ required: true, enum: ['MTN', 'AIRTEL'] })
	paymentMethod!: string;

	@prop()
	transactionId?: string;

	@prop()
	failureReason?: string;

	@prop({ type: String, required: true })
	comment!: string;
}
