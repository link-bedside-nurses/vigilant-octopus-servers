declare module 'fawn'

export type DESIGNATION = 'PATIENT' | 'NURSE' | 'ADMIN'

export interface ACCOUNT {
	id: string
	designation: DESIGNATION
	phone?: string,
	email?: string
}

declare global {
	namespace Express {
		interface Request {
			account?: ACCOUNT
		}
	}
	namespace Application { }
}
