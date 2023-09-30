import { caregiversRepo } from "../db-repo";

export default async function listCaregiversHandler() {
  const caregivers = await caregiversRepo.find();

  return {
    count: caregivers.length,
    data: caregivers,
  };
}
