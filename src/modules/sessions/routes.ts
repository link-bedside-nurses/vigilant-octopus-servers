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

router.post("/:id", authenticate, makeCallback(getSession()));
router.post("/confirm/:id", authenticate, makeCallback(confirmSession()));
router.post("/cancel/:id", authenticate, makeCallback(cancelSession()));
router.post("/patients", authenticate, makeCallback(getPatientSessions()));
router.post("/caregivers", authenticate, makeCallback(getCaregiverSessions()));

export { router as sessionRouter };
