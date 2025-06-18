import { getModelForClass } from '@typegoose/typegoose';

import { Appointment } from './models/Appointment';
import { Nurse } from './models/Nurse';
import { Payment } from './models/Payment';
import { Patient } from './models/Patient';
import { Admin } from './models/Admin';

export const db = Object.freeze( {
	appointments: getModelForClass( Appointment ),
	nurses: getModelForClass( Nurse ),
	patients: getModelForClass( Patient ),
	admins: getModelForClass( Admin ),
	payments: getModelForClass( Payment ),
} );

export type DatabaseType = typeof db;
