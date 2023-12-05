import { APPOINTMENT_STATUSES } from '@/interfaces/appointment-statuses'
import { DocumentType, Severity, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				delete ret.__v
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
export class Appointment {
	@prop( { required: true, ref: 'Patient', index: true } )
	patientId!: string

	@prop( { required: true, ref: 'Caregiver', index: true } )
	caregiverId!: string

	@prop( { required: true } )
	date!: Date

	@prop( {
		enum: APPOINTMENT_STATUSES,
		default: APPOINTMENT_STATUSES.PENDING,
		index: true,
	} )
	status!: string

	@prop( { type: String, required: true } )
	reasonForVisit!: string

	@prop( { type: String, required: false, default: '' } )
	cancellationReason?: string

	@prop( { type: () => [String], required: false, default: [] } )
	symptoms?: string[]

	@prop( { type: String, required: false } )
	notes?: string

	public async confirmAppointment( this: DocumentType<Appointment> ): Promise<void> {
		this.status = APPOINTMENT_STATUSES.CONFIRMED
		await this.save()
	}

	public async cancelAppointment( this: DocumentType<Appointment>, reason?: string ): Promise<void> {
		this.status = APPOINTMENT_STATUSES.CANCELLED
		this.cancellationReason = reason
		await this.save()
	}
}
