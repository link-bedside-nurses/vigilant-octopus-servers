import { Caregiver } from '@/db/schemas/Caregiver'
import { Patient } from '@/db/schemas/Patient'
import { APPOINTMENT_STATUSES } from '@/interfaces/appointment-statuses'
import { DocumentType, Ref, Severity, modelOptions, prop } from '@typegoose/typegoose'

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

	@prop( { ref: () => Patient, foreignField: "_id", localField: "patientId", justOne: true } )
	patient?: Ref<Patient>

	@prop( { required: true, ref: 'Caregiver', index: true } )
	caregiverId!: string

	@prop( { ref: () => Caregiver, foreignField: "_id", localField: "caregiverId", justOne: true } )
	caregiver?: Ref<Caregiver>

	@prop( { required: true, index: true } )
	title!: string

	@prop( { required: true, default: Date.now() } )
	date!: Date

	@prop( {
		enum: APPOINTMENT_STATUSES,
		default: APPOINTMENT_STATUSES.PENDING,
		index: true,
	} )
	status!: string

	@prop( { type: String, required: false, default: '' } )
	cancellationReason?: string

	@prop( { type: String, required: false } )
	description?: string

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
