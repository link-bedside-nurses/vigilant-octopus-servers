import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
  getCaregiverLocation,
  getPatientLocation,
  setCaregiverLocation,
  setPatientLocation,
  updateCaregiverLocation,
  updatePatientLocation,
} from "@/modules/location/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.get("/patient", authenticate, makeCallback(getPatientLocation()));
router.post("/patient", authenticate, makeCallback(setPatientLocation()));
router.put("/patient", authenticate, makeCallback(updatePatientLocation()));

router.get("/caregiver", authenticate, makeCallback(getCaregiverLocation()));
router.post("/caregiver", authenticate, makeCallback(setCaregiverLocation()));
router.put("/caregiver", authenticate, makeCallback(updateCaregiverLocation()));

export { router as locationRouter };
