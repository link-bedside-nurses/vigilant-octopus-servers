import * as jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import { Exception, Logger } from "@/utils";
import { EnvironmentVars } from "@/constants";

export default function authenticate(request: Request, _response: Response, next: NextFunction) {
  // get headers
  if (
    !request.headers.authorization ||
    !request.headers.authorization.split(" ").includes("Bearer")
  ) {
    return next(new Exception("Unauthorized access"));
  }

  // check authorization for bearer token
  const token = request.headers.authorization.split("Bearer ")[1].trim();
  // TODO: remove this logger later on.
  if (process.env.NODE_ENV === "development") {
    Logger.info(token, "Access Token");
  }

  if (!token || !jwt.verify(token, EnvironmentVars.getAccessTokenSecret()))
    return next(new Exception("Invalid Access Token!"));

  // get decoded info with user id.
  const decoded = jwt.verify(token, EnvironmentVars.getAccessTokenSecret()) as { id: string };
  if (!decoded || !decoded.id) return next(new Exception("Invalid Access Token!"));

  // Attach user to express request object.
  request.account = { id: decoded.id };
  next();
}
