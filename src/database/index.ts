import { getModelForClass } from "@typegoose/typegoose";

import { Patient } from "@/database/schemas/Patient";
import { Caregiver } from "@/database/schemas/Caregiver";
import { Admin } from "@/database/schemas/Admin";
import { Session } from "@/database/schemas/Session";
import { Rating } from "@/database/schemas/Rating";
import { Location } from "@/database/schemas/Location";

export const db = Object.freeze({
  patients: getModelForClass(Patient),
  caregivers: getModelForClass(Caregiver),
  admins: getModelForClass(Admin),
  sessions: getModelForClass(Session),
  locations: getModelForClass(Location),
  ratings: getModelForClass(Rating),
});

export type DatabaseType = typeof db;
