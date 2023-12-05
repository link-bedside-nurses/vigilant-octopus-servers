import { getModelForClass } from '@typegoose/typegoose'

import { Appointment } from '@/db/schemas/Appointment'
import { Rating } from '@/db/schemas/Rating'
import { Caregiver } from '@/db/schemas/Caregiver'
import { Payment } from '@/db/schemas/Payment'
import { Patient } from '@/db/schemas/Patient'
import { Admin } from '@/db/schemas/Admin'

export const db = Object.freeze( {
	appointments: getModelForClass( Appointment ),
	ratings: getModelForClass( Rating ),
	caregivers: getModelForClass( Caregiver ),
	patients: getModelForClass( Patient ),
	admins: getModelForClass( Admin ),
	payments: getModelForClass( Payment ),
} )

export type DatabaseType = typeof db
