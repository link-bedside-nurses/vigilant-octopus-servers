import { ACCOUNT } from '../interfaces';
export type DESIGNATION = 'PATIENT' | 'NURSE' | 'ADMIN';

declare global {
	namespace Express {
		interface Request {
			account?: ACCOUNT;
		}
	}
	namespace Application {}
}
