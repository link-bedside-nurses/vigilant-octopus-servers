import { DocumentType, Ref, Severity, modelOptions, mongoose, prop } from '@typegoose/typegoose';
import { Patient } from './Patient';
import { APPOINTMENT_STATUSES } from '../../interfaces';
import { Nurse } from './Nurse';

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

	@prop( { type: mongoose.Types.ObjectId, required: false, ref: Nurse, index: true } )
	nurse: Ref<Nurse>;

	@prop( { required: true, type: Array } )
	symptoms!: string[];

	@prop( { required: true, default: Date.now() } )
	date!: Date;

	@prop( {
		enum: APPOINTMENT_STATUSES,
		default: APPOINTMENT_STATUSES.PENDING,
		index: true,
	} )
	status!: APPOINTMENT_STATUSES;

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
	): Promise<void> {
		this.status = APPOINTMENT_STATUSES.CANCELLED;
		await this.save();
	}

	public async assignNurse(
		this: DocumentType<Appointment>,

	): Promise<void> {
		this.status = APPOINTMENT_STATUSES.CANCELLED;
		await this.save();
	}
}
