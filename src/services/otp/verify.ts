import { db } from "@/database";

export async function verify(
  type: "patient" | "caregiver",
  otp: string,
  phone: string,
) {
  let user;
  if (type === "patient") {
    user = await db.patients.findOne({ phone });
  } else if (type === "caregiver") {
    user = await db.caregivers.findOne({ phone });
  } else {
    return false;
  }

  if (!user) {
    return false;
  }

  return user.otp === otp;
}
