import { DocumentType, Ref, Severity, modelOptions, mongoose, prop } from '@typegoose/typegoose';
import { Patient } from './Patient';
import { APPOINTMENT_STATUSES } from '../../../core/interfaces';
import { Caregiver } from './Caregiver';
import { Location } from './Location';

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
export class Appointment {
	@prop( { type: mongoose.Types.ObjectId, required: true, ref: Patient } )
	patient!: Ref<Patient>;

	@prop( { type: mongoose.Types.ObjectId, required: true, ref: Caregiver, index: true } )
	caregiver!: Ref<Caregiver>;

	@prop( { required: true, type: Array } )
	symptoms!: string[];

	@prop( { required: true, default: Date.now() } )
	date!: Date;

	@prop( { type: Location, index: '2dsphere' } )
	location!: Location;

	@prop( {
		enum: APPOINTMENT_STATUSES,
		default: APPOINTMENT_STATUSES.PENDING,
		index: true,
	} )
	status!: APPOINTMENT_STATUSES;

	@prop( { type: String, required: false, default: '' } )
	cancellationReason?: string;

	public async confirmAppointment( this: DocumentType<Appointment> ): Promise<void> {
		this.status = APPOINTMENT_STATUSES.IN_PROGRESS;
		await this.save();
	}

	public async updateAppointmentStatus( this: DocumentType<Appointment>, { status }: { status: APPOINTMENT_STATUSES } ): Promise<void> {
		this.status = status;
		await this.save();
	}

	public async cancelAppointment(
		this: DocumentType<Appointment>,
		cancellationReason?: string
	): Promise<void> {
		this.status = APPOINTMENT_STATUSES.CANCELLED;
		this.cancellationReason = cancellationReason;
		await this.save();
	}
}
