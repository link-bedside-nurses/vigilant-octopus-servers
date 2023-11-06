import { prop } from '@typegoose/typegoose'
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
