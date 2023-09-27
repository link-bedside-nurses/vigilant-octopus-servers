import { getModelForClass } from "@typegoose/typegoose";

import { Account } from "./schemas/account";

export const Database = Object.freeze({
  accounts: getModelForClass(Account),
});

export type DatabaseType = typeof Database;
