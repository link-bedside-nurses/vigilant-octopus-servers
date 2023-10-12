import { getModelForClass } from "@typegoose/typegoose";

import { Patient } from "@/database/schemas/Patient";
import { Caregiver } from "@/database/schemas/Caregiver";
import {Admin} from "@/database/schemas/Admin";
import {Session} from "@/database/schemas/Session";

export const db = Object.freeze({
  patients: getModelForClass(Patient),
  caregivers: getModelForClass(Caregiver),
  admins: getModelForClass(Admin),
  sessions: getModelForClass(Session)
});

export type DatabaseType = typeof db;