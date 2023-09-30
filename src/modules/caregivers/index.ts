import makeCallback from "@/adapters/express-callback";
import { Router } from "express";
import makeGetCaregiversController from "./controllers/get-caregivers";

const router = Router();

router.get(`/`, makeCallback(makeGetCaregiversController()));

export default router;
