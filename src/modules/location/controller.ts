import { HTTPRequest } from "@/adapters/express-callback";
import { db } from "@/database";
import { StatusCodes } from "http-status-codes";

export function getLocation() {
  return async function (request: HTTPRequest<object, object>) {
    const DS = request.account?.designation;

    if (!DS) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "Designation must be specified!",
        },
      };
    }

    if (!(DS === "PATIENT" || DS === "CAREGIVER")) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "Invalid Designation",
        },
      };
    }

    const location = await db.locations.findOne({
      userId: request?.account?.id,
    });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: location,
        message: " location retrieved",
      },
    };
  };
}

export function updateLocation() {
  return async function (
    request: HTTPRequest<
      object,
      {
        lng: number;
        lat: number;
      },
      object
    >,
  ) {
    const DS = request.account?.designation;

    if (!DS) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "Designation must be specified!",
        },
      };
    }

    if (!(DS === "PATIENT" || DS === "CAREGIVER")) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "Invalid Designation",
        },
      };
    }

    const location = await db.locations.findByIdAndUpdate(
      request?.account?.id,
      {
        userId: request?.account?.id,
        lng: request.body.lng,
        lat: request.body.lng,
      },
    );

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: location,
        message: "location updated",
      },
    };
  };
}
