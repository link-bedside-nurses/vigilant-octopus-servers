import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import { completeCaregiverProfile } from "@/modules/profile/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.post(
  "/caregiver/",
  authenticate,
  makeCallback(completeCaregiverProfile()),
);

export { router as profileRouter };
