import { Database } from "@/database";

import makeDB from "./make-db";

export const caregiversDB = makeDB({ database: Database });

export type CaregiversDBType = typeof caregiversDB;
