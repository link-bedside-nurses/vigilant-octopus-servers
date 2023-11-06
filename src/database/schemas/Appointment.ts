import { DocumentType, prop } from '@typegoose/typegoose'

export class Appointment {
	@prop({ required: true, ref: 'User', index: true })
	patientId!: string

	@prop({ required: true, ref: 'User', index: true })
	caregiverId!: string

	@prop({ required: true })
	date!: Date

	@prop({
		enum: ['pending', 'confirmed', 'cancelled', 'In progress'],
		default: 'pending',
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

	public async confirmAppointment(this: DocumentType<Appointment>): Promise<void> {
		this.status = 'confirmed'
		await this.save()
	}

	public async cancelAppointment(this: DocumentType<Appointment>, reason?: string): Promise<void> {
		this.status = 'cancelled'
		this.cancellationReason = reason
		await this.save()
	}
}
