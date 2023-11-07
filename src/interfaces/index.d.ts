declare module 'fawn'

export type DESIGNATION = 'PATIENT' | 'CAREGIVER' | 'ADMIN'

export interface ACCOUNT {
	id: string
	designation: DESIGNATION
	phone: string
}

declare global {
	namespace Express {
		interface Request {
			account?: ACCOUNT
		}
	}
	namespace Application {}
}
