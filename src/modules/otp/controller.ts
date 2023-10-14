import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { generate } from "@/services/otp/generate";
import { db } from "@/database";
import { checkIsOTPExpired, verify } from "@/services/otp/verify";
import logger from "@/utils/logger";

export function getOTP() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function (
    request: HTTPRequest<
      object,
      object,
      {
        user_type: "patient" | "caregiver";
      }
    >,
  ) {
    const otp = await generate();

    logger.info(request);

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: otp,
        message: "OTP received",
      },
    };
  };
}

export function verifyOTP() {
  return async function (
    request: HTTPRequest<
      object,
      {
        otp: string;
      },
      {
        user_type: "patient" | "caregiver";
      }
    >,
  ) {
    let user;
    if (request.query.user_type === "patient") {
      user = await db.patients.findOne({ otp: request.body.otp });
    } else if (request.query.user_type === "caregiver") {
      user = await db.caregivers.findOne({ otp: request.body.otp });
    } else {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: false,
          message: "Invalid user type",
        },
      };
    }

    if (!user) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: false,
          message: "Could not verify OTP, No user found",
        },
      };
    }
    const isExpired = checkIsOTPExpired(request.body.otp);

    if (isExpired) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: false,
          message: "OTP Expired",
        },
      };
    }

    const stored = user.otp;
    const verified = verify(stored, request.body.otp);

    if (!verified) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: false,
          message: "OTP verification failed. Incorrect codes",
        },
      };
    }

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: true,
        message: "OTP Verified",
      },
    };
  };
}
