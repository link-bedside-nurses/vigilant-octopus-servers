import { getModelForClass } from '@typegoose/typegoose'

import { Session } from '@/database/schemas/Session'
import { Rating } from '@/database/schemas/Rating'
import { Caregiver } from '@/database/schemas/Caregiver'
import { Payment } from '@/database/schemas/Payment'
import { Patient } from '@/database/schemas/Patient'
import { Admin } from '@/database/schemas/Admin'

export const db = Object.freeze({
	sessions: getModelForClass(Session),
	ratings: getModelForClass(Rating),
	caregivers: getModelForClass(Caregiver),
	patients: getModelForClass(Patient),
	admins: getModelForClass(Admin),
	payments: getModelForClass(Payment),
})

export type DatabaseType = typeof db
