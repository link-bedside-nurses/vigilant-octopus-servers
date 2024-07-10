import { getModelForClass } from '@typegoose/typegoose';

import { Appointment } from './models/Appointment';
import { Rating } from './models/Rating';
import { Caregiver } from './models/Caregiver';
import { Payment } from './models/Payment';
import { Patient } from './models/Patient';
import { Admin } from './models/Admin';

export const db = Object.freeze({
	appointments: getModelForClass(Appointment),
	ratings: getModelForClass(Rating),
	caregivers: getModelForClass(Caregiver),
	patients: getModelForClass(Patient),
	admins: getModelForClass(Admin),
	payments: getModelForClass(Payment),
});

export type DatabaseType = typeof db;
