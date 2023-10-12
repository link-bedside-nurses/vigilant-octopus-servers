import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
  completeCaregiverProfile,
  completePatientProfile,
} from "@/modules/profile/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.post("/patient", authenticate, makeCallback(completePatientProfile()));
router.post(
  "/caregiver/",
  authenticate,
  makeCallback(completeCaregiverProfile()),
);

export { router as profileRouter };
