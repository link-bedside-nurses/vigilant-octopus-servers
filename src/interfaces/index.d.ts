// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Express, { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      account?: { id: string };
    }
  }

  namespace Application {}
}
