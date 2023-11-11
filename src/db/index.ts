import { getModelForClass } from '@typegoose/typegoose'

import { Session } from '@/db/schemas/Session'
import { Rating } from '@/db/schemas/Rating'
import { Caregiver } from '@/db/schemas/Caregiver'
import { Payment } from '@/db/schemas/Payment'
import { Patient } from '@/db/schemas/Patient'
import { Admin } from '@/db/schemas/Admin'

export const db = Object.freeze({
	sessions: getModelForClass(Session),
	ratings: getModelForClass(Rating),
	caregivers: getModelForClass(Caregiver),
	patients: getModelForClass(Patient),
	admins: getModelForClass(Admin),
	payments: getModelForClass(Payment),
})

export type DatabaseType = typeof db
