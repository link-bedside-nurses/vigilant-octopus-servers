import makeCallback from "@/adapters/express-callback";
import { Router } from "express";

import { error, ping } from "@/modules/test/controller";
import authenticate from "@/middlewares/authentication";

const router = Router();

router.get("/ping", authenticate, makeCallback(ping()));
router.get("/error", authenticate, makeCallback(error()));

export { router as testRouter };
