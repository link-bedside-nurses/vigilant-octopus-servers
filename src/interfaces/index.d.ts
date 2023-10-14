declare module "fawn";

export type DESIGNATION = "PATIENT" | "CAREGIVER" | "ADMIN" | "SUPER-ADMIN";

declare global {
  namespace Express {
    interface Request {
      account?: { id?: string; designation: DESIGNATION; phone: string };
    }
  }
  namespace Application {}
}
