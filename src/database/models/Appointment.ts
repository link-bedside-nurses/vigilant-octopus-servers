import { DocumentType, Ref, Severity, modelOptions, mongoose, prop } from '@typegoose/typegoose';
import { APPOINTMENT_STATUSES } from '../../interfaces';
import { Admin } from './Admin';
import { Nurse } from './Nurse';
import { Patient } from './Patient';

@modelOptions({
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform(_doc, ret): void {
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
})
export class Appointment {
	@prop({ type: mongoose.Types.ObjectId, required: true, ref: Patient, index: true })
	patient!: Ref<Patient>;

	@prop({ type: mongoose.Types.ObjectId, required: false, ref: Nurse, index: true })
	nurse?: Ref<Nurse>;

	@prop({ required: true, type: Array })
	symptoms!: string[];

	@prop({ required: true, default: Date.now() })
	date!: Date;

	@prop({
		enum: APPOINTMENT_STATUSES,
		default: APPOINTMENT_STATUSES.PENDING,
		index: true,
	})
	status!: APPOINTMENT_STATUSES;

	// Nurse assignment fields
	@prop({ type: Date, required: false })
	nurseAssignedAt?: Date;

	@prop({ type: mongoose.Types.ObjectId, required: false, ref: 'Admin' })
	assignedBy?: Ref<Admin>; // Admin who assigned the nurse

	@prop({ type: String, required: false })
	assignmentNotes?: string;

	@prop({ type: Boolean, required: false, default: false })
	nurseNotified?: boolean;

	@prop({ type: Boolean, required: false, default: false })
	patientNotified?: boolean;

	@prop({ type: Date, required: false })
	lastNotificationSent?: Date;

	// Cancellation fields
	@prop({ type: String, required: false })
	cancellationReason?: string;

	@prop({ type: mongoose.Types.ObjectId, required: false, ref: 'Admin' })
	cancelledBy?: Ref<Admin>; // Admin who cancelled

	@prop({ type: Date, required: false })
	cancelledAt?: Date;

	@prop({
		enum: ['UNPAID', 'PENDING', 'PAID', 'FAILED'],
		default: 'UNPAID',
		required: false,
	})
	paymentStatus?: 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED';

	@prop({ type: [mongoose.Types.ObjectId], ref: 'Payment', required: false, default: [] })
	payments?: mongoose.Types.ObjectId[];

	@prop({ type: String, required: false })
	description?: string;

	public async confirmAppointment(this: DocumentType<Appointment>): Promise<void> {
		this.status = APPOINTMENT_STATUSES.IN_PROGRESS;
		await this.save();
	}

	public async updateAppointmentStatus(
		this: DocumentType<Appointment>,
		{ status }: { status: APPOINTMENT_STATUSES }
	): Promise<void> {
		this.status = status;
		await this.save();
	}

	public async cancelAppointment(this: DocumentType<Appointment>): Promise<void> {
		this.status = APPOINTMENT_STATUSES.CANCELLED;
		await this.save();
	}

	public async assignNurse(
		this: DocumentType<Appointment>,
		nurseId: string,
		adminId: string,
		notes?: string
	): Promise<void> {
		this.nurse = nurseId as any;
		this.status = APPOINTMENT_STATUSES.ASSIGNED;
		this.nurseAssignedAt = new Date();
		this.assignedBy = adminId as any;
		this.assignmentNotes = notes;
		this.nurseNotified = false;
		this.patientNotified = false;
		await this.save();
	}

	public async markNotificationsSent(this: DocumentType<Appointment>): Promise<void> {
		this.nurseNotified = true;
		this.patientNotified = true;
		this.lastNotificationSent = new Date();
		await this.save();
	}
}
