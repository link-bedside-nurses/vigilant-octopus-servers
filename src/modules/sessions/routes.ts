import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
  cancelSession,
  confirmSession,
  getCaregiverSessions,
  getPatientSessions,
  getSession,
} from "@/modules/sessions/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.post("/sessions/:id", authenticate, makeCallback(getSession()));
router.post(
  "/sessions/confirm/:id",
  authenticate,
  makeCallback(confirmSession()),
);
router.post(
  "/sessions/cancel/:id",
  authenticate,
  makeCallback(cancelSession()),
);
router.post(
  "/patients/sessions",
  authenticate,
  makeCallback(getPatientSessions()),
);
router.post(
  "/caregivers/sessions",
  authenticate,
  makeCallback(getCaregiverSessions()),
);

export { router as authRouter };
