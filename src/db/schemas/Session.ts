import { SESSION_STATUSES } from '@/interfaces/session-statuses'
import { DocumentType, Severity, modelOptions, prop } from '@typegoose/typegoose'

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
export class Session {
	@prop({ required: true, ref: 'Patient', index: true })
	patientId!: string

	@prop({ required: true, ref: 'Caregiver', index: true })
	caregiverId!: string

	@prop({ required: true })
	date!: Date

	@prop({
		enum: SESSION_STATUSES,
		default: SESSION_STATUSES.PENDING,
		index: true,
	})
	status!: string

	@prop({ type: String, required: true })
	reasonForVisit!: string

	@prop({ type: String, required: false, default: '' })
	cancellationReason?: string

	@prop({ type: () => [String], required: false, default: [] })
	symptoms?: string[]

	@prop({ type: String, required: false })
	notes?: string

	public async confirmSession(this: DocumentType<Session>): Promise<void> {
		this.status = SESSION_STATUSES.CONFIRMED
		await this.save()
	}

	public async cancelSession(this: DocumentType<Session>, reason?: string): Promise<void> {
		this.status = SESSION_STATUSES.CANCELLED
		this.cancellationReason = reason
		await this.save()
	}
}
