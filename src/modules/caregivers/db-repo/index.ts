import { Database } from "@/database";

import makeDB from "./make-db";

export const caregiversRepo = makeDB({ database: Database });

export type CaregiversDBType = typeof caregiversRepo;
