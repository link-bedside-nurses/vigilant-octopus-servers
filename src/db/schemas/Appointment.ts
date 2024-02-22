import { Caregiver } from '../../db/schemas/Caregiver'
import { APPOINTMENT_STATUSES } from '../../interfaces/appointment-statuses'
import { DocumentType, Severity, modelOptions, mongoose, prop } from '@typegoose/typegoose'
import { Patient } from './Patient'

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
	@prop( {
		required: true,
		type: mongoose.Document,
		ref: Patient,
	} )
	patient!: string;

	@prop( {
		required: true,
		type: mongoose.Types.ObjectId,
		ref: Caregiver,
	} )
	caregiver!: string;

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
