import { getModelForClass } from "@typegoose/typegoose";

import { Patient } from "@/database/schemas/Patient";
import { Caregiver } from "@/database/schemas/Caregiver";
import {Admin} from "@/database/schemas/Admin";

export const db = Object.freeze({
  patients: getModelForClass(Patient),
  caregivers: getModelForClass(Caregiver),
  admins: getModelForClass(Admin)
});

export type DatabaseType = typeof db;