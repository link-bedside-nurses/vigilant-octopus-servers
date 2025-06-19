import { NextFunction, Request, Response } from 'express';

import mongoose from 'mongoose';
import HTTPException from '../utils/exception';

export const validateObjectID = (req: Request, res: Response, next: NextFunction) => {
	if (!req.params.id || !mongoose.isValidObjectId(req.params.id))
		return next(new HTTPException('Invalid object id!'));

	next();
};
