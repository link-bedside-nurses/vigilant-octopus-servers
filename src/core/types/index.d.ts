import { ACCOUNT } from '../interfaces';
export type DESIGNATION = 'PATIENT' | 'CAREGIVER' | 'ADMIN';

declare global {
	namespace Express {
		interface Request {
			account?: ACCOUNT;
		}
	}
	namespace Application {}
}
