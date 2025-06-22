import { NextFunction, Request, Response } from 'express';

import mongoose from 'mongoose';
import HTTPException from '../utils/exception';

export const validateObjectID = (req: Request, res: Response, next: NextFunction) => {
	if (!req.account!.id || !mongoose.isValidObjectId(req.account!.id))
		return next(new HTTPException('Invalid database id!'));

	next();
};
