import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import { getLocation, updateLocation } from "@/modules/location/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.get("/", authenticate, makeCallback(getLocation()));
router.put("/", authenticate, makeCallback(updateLocation()));

export { router as locationRouter };
