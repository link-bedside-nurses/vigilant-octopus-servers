import { db } from "@/database";

import makeDB from "./make-db";

export const caregiversRepo = makeDB({ database: db });

export type CaregiversDBType = typeof caregiversRepo;
