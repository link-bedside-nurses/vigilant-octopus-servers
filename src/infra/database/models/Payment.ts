import { Severity, modelOptions, mongoose, prop } from '@typegoose/typegoose';
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

	@prop({
		required: true,
		type: mongoose.Document,
		ref: Patient,
	})
	patient!: Patient;

	@prop({ type: String, required: true })
	amount!: number;

	@prop({ type: String, required: true })
	comment!: string;
}
