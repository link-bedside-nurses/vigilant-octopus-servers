import { HTTPRequest } from "@/adapters/express-callback";
import { db } from "@/database";
import { StatusCodes } from "http-status-codes";

export function getPatientLocation() {
  return async function (
    request: HTTPRequest<
      object,
      {
        value: number;
        caregiverId: string;
      },
      object
    >,
  ) {
    const location = await db.locations.findOne({
      patientId: request?.account?.id,
    });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: location,
        message: "Patient location retrieved",
      },
    };
  };
}

export function updatePatientLocation() {
  return async function (request: HTTPRequest<object, object>) {
    const location = await db.locations.findOne({
      patientId: request?.account?.id,
    });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: location,
        message: "Patient location retrieved",
      },
    };
  };
}

export function setPatientLocation() {
  return async function (request: HTTPRequest<object, object>) {
    const location = await db.locations.findOne({
      patientId: request?.account?.id,
    });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: location,
        message: "Patient location retrieved",
      },
    };
  };
}
