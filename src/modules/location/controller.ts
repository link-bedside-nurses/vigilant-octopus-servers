import { HTTPRequest } from "@/adapters/express-callback";
import { db } from "@/database";
import { StatusCodes } from "http-status-codes";

export function getLocation() {
  return async function (
    request: HTTPRequest<
      {
        user: "patient" | "caregiver";
      },
      object
    >,
  ) {
    let location;
    if (request.params.user === "patient") {
      location = await db.locations.findOne({
        patientId: request?.account?.id,
      });
    } else {
      location = await db.locations.findOne({
        caregiverId: request?.account?.id,
      });
    }

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
    const location = await db.locations.findByIdAndUpdate(
      request?.account?.id,
      {
        patientId: request?.account?.id,
        lng: request.body.lng,
        lat: request.body.lng,
      },
    );

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: location,
        message: " location updated",
      },
    };
  };
}

export function setLocation() {
  return async function (request: HTTPRequest<object, object>) {
    const location = await db.locations.findOne({
      patientId: request?.account?.id,
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
