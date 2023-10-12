import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import {
  completeCaregiverProfile,
  completePatientProfile,
} from "@/modules/profile/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.post(
  "/profile/patient",
  authenticate,
  makeCallback(completePatientProfile()),
);
router.post(
  "/profile/caregiver/",
  authenticate,
  makeCallback(completeCaregiverProfile()),
);

export { router as authRouter };
