import { getModelForClass } from '@typegoose/typegoose'

import { Appointment } from '@/database/schemas/Appointment'
import { Rating } from '@/database/schemas/Rating'
import { User } from '@/database/schemas/User'
import { Payment } from '@/database/schemas/Payment'

export const db = Object.freeze({
	appointments: getModelForClass(Appointment),
	ratings: getModelForClass(Rating),
	users: getModelForClass(User),
	payments: getModelForClass(Payment),
})

export type DatabaseType = typeof db
