import { Severity, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
	schemaOptions: {
		id: true,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform(_doc, ret): void {
				delete ret.__v
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
})
export class Payment {
	@prop({ required: true, ref: 'Appointment', index: true })
	appointmentId!: string

	@prop({ required: true, ref: 'User', index: true })
	patientId!: string

	@prop({ required: true, ref: 'User', index: true })
	caregiverId!: string

	@prop({ type: String, required: true })
	amount!: number

	@prop({ type: String, required: true })
	comment!: string
}
