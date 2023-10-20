import { randomBytes } from "crypto";
import logger from "@/utils/logger";

export const generate = async () => {
  try {
    const randomBuffer = await new Promise<Buffer>((resolve, reject) => {
      randomBytes(2, (err, buf) => {
        if (err) {
          reject(err);
        } else {
          resolve(buf);
        }
      });
    });

    // Convert the random bytes to a 5-digit number
    return (randomBuffer.readUInt16BE() % 100000).toString().padStart(5, "0");
  } catch (error) {
    logger.error("Error: ", error);
    // Handle the error or return a default OTP as appropriate
    return "00000"; // Default 5-digit OTP
  }
};

generate().then((otp) => {
  logger.info("Generated OTP:", otp);
});
