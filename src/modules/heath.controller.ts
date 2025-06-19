import { NextFunction, Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { response } from '../utils/http-response';
import logger from '../utils/logger';

const router = Router();

// GET /heath/ping
router.get('/ping', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		logger.info('server is running:sending pong');
		return res.send(response(StatusCodes.OK, null, 'pong'));
	} catch (err) {
		return next(err);
	}
});

// GET /heath/error
router.get('/error', async (_req: Request, res: Response, next: NextFunction) => {
	try {
		logger.error('Intended Error!');
		throw new Error('Intended Error!');
	} catch (err) {
		return next(err);
	}
});

export default router;
