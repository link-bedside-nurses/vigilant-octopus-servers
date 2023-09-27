import HTTPException from "@/utils/exception";
import { Request, Response, NextFunction } from "express";

export default function errorMiddleware(
  error: HTTPException & {
    code?: number | string;
    keyPattern?: { [key: string]: number };
    keyValue?: { [key: string]: unknown };
    kind?: string;
    errors?: { [key: string]: unknown }[];
  },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  let status = error.statusCode || 500;
  let message = error.message;

  // Log error
  // console.error(error);

  // document uniqueness and duplicates error
  if (error.code === 11000 && error.keyValue !== undefined) {
    const key = Object.keys(error.keyValue)[0];
    message = `${key.charAt(0).toUpperCase() + key.slice(1)}: '${error.keyValue[key]}' is already taken`;
    status = 400;
  }

  if (error.name === "CastError" && error.kind === "ObjectId") {
    status = 400;
    message = `Provided Id is an invalid ObjectId.`;
  }

  // Custom error, from zod for now
  if (error.errors && error.errors.length > 0) {
    status = 400;
    message = (error.errors[0].message as string) ?? error.message;
  }

  if (error)
    res.status(status).send({
      status,
      message,
    });
}
