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
export class Rating {
	@prop({ required: true, ref: 'User', index: true })
	patientId!: string

	@prop({ required: true, ref: 'User', index: true })
	caregiverId!: string

	@prop({ type: String, required: false, default: '' })
	review?: string

	@prop({ type: Number, required: true })
	value!: number
}
