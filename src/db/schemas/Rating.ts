import { Severity, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
	schemaOptions: {
		id: false,
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
export class Rating {
	@prop({ required: true, ref: 'Patient', index: true })
	patientId!: string

	@prop({ required: true, ref: 'Caregiver', index: true })
	caregiverId!: string

	@prop({ type: String, required: false, default: '' })
	review?: string

	@prop({ type: Number, required: true })
	value!: number
}
