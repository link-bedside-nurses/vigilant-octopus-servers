import { getModelForClass } from "@typegoose/typegoose";

import { Session } from "@/database/schemas/Session";
import { Rating } from "@/database/schemas/Rating";
import { Location } from "@/database/schemas/Location";
import { User } from "@/database/schemas/User";

export const db = Object.freeze({
  sessions: getModelForClass(Session),
  locations: getModelForClass(Location),
  ratings: getModelForClass(Rating),
  users: getModelForClass(User),
});

export type DatabaseType = typeof db;
