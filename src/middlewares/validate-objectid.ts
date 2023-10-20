import { NextFunction, Request, Response } from "express";

import mongoose from "mongoose";
import { Exception } from "@/utils";

const validateObjectID = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.params.id || !mongoose.isValidObjectId(req.params.id))
    return next(new Exception("Invalid object id!"));

  next();
};
export { validateObjectID };
