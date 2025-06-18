import { ACCOUNT } from './interfaces';

declare global {
	namespace Express {
		interface Request {
			account?: ACCOUNT;
		}
	}
	namespace Application { }
}
