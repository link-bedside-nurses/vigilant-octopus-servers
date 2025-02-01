import { index, modelOptions, prop, Severity } from '@typegoose/typegoose';
import { Location } from './Location';
import { DESIGNATION } from '../../../core/interfaces';

export interface DaySchedule {
	enabled: boolean;
	start: string;
	end: string;
}

export interface WeeklySchedule {
	monday: DaySchedule;
	tuesday: DaySchedule;
	wednesday: DaySchedule;
	thursday: DaySchedule;
	friday: DaySchedule;
	saturday: DaySchedule;
	sunday: DaySchedule;
}

const DEFAULT_SCHEDULE: WeeklySchedule = {
	monday: { enabled: true, start: '00:00', end: '23:59' },
	tuesday: { enabled: true, start: '00:00', end: '23:59' },
	wednesday: { enabled: true, start: '00:00', end: '23:59' },
	thursday: { enabled: true, start: '00:00', end: '23:59' },
	friday: { enabled: true, start: '00:00', end: '23:59' },
	saturday: { enabled: true, start: '00:00', end: '23:59' },
	sunday: { enabled: true, start: '00:00', end: '23:59' }
};

@modelOptions( {
	schemaOptions: {
		id: false,
		virtuals: true,
		timestamps: true,
		toObject: { virtuals: true },
		toJSON: {
			virtuals: true,
			transform( _doc, ret ): void {
				delete ret.password;
				ret.id = _doc._id;
				delete ret._id;
				delete ret.__v;
			},
		},
	},
	options: { allowMixed: Severity.ALLOW },
} )
@index( { title: 'text', location: '2dsphere' } )
export class Caregiver {
	@prop( {
		type: String,
		required: false,
		enum: [DESIGNATION.PATIENT, DESIGNATION.CAREGIVER, DESIGNATION.ADMIN],
		default: DESIGNATION.CAREGIVER,
	} )
	designation!: DESIGNATION;

	@prop( {
		type: String,
		required: true,
		unique: true,
		index: true,
		trim: true,
	} )
	phone!: string;

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	firstName!: string;

	@prop( { type: String, required: true, minlength: 2, maxlength: 250, trim: true } )
	lastName!: string;

	@prop( { type: String, required: true } )
	password!: string;

	@prop( { type: String, required: false, unique: true, trim: true } )
	email?: string;

	@prop( { type: [String], required: false, default: [] } )
	qualifications!: string[];

	@prop( { type: String, required: false, default: 'pending' } )
	verificationStatus?: 'pending' | 'approved' | 'rejected';

	@prop( { type: String, required: false } )
	verificationNotes?: string;

	@prop( { type: Location, index: '2dsphere', required: false } )
	location?: Location;

	@prop( { type: Boolean, required: false, default: false } )
	isPhoneVerified?: boolean;

	@prop( { type: String, required: false, default: '', trim: true } )
	imgUrl?: string;

	@prop( { type: Boolean, required: false, default: false } )
	isBanned?: boolean;

	@prop( { type: Boolean, required: false, default: false } )
	isActive?: boolean;

	@prop( { type: Boolean, required: false, default: false } )
	isVerified?: boolean;

	@prop( {
		type: Object,
		required: false,
		default: DEFAULT_SCHEDULE
	} )
	availability?: WeeklySchedule;

	public isAvailableAt( date: Date ): boolean {
		const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
		const dayOfWeek = days[date.getDay()];
		const timeStr = date.toLocaleTimeString( 'en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit'
		} );

		const schedule = this.availability?.[dayOfWeek as keyof WeeklySchedule];
		if ( !schedule?.enabled ) return false;

		return timeStr >= schedule.start && timeStr <= schedule.end;
	}
}
