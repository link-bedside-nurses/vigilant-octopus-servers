import { getModelForClass } from "@typegoose/typegoose";

import { Customer } from "./schemas/customers";
import { Caregiver } from "./schemas/caregivers";

export const Database = Object.freeze({
  customers: getModelForClass(Customer),
  caregivers: getModelForClass(Caregiver),
});

export type DatabaseType = typeof Database;
