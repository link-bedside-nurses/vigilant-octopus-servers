import { DatabaseType } from "@/database";

export default function makeDB({ database }: { database: DatabaseType }) {
  return Object.freeze({
    find,
  });

  function find() {
    return database.caregivers.find({});
  }
}
