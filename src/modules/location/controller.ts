import { HTTPRequest } from "@/adapters/express-callback";
import { db } from "@/database";
import { StatusCodes } from "http-status-codes";

export function getPatientLocation() {
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

export function getCaregiverLocation() {
  return async function (request: HTTPRequest<object, object>) {
    const location = await db.locations.findOne({
      caregiverId: request?.account?.id,
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

export function updatePatientLocation() {
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

export function updateCaregiverLocation() {
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
        caregiverId: request?.account?.id,
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

export function setPatientLocation() {
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
    const location = await db.locations.create({
      patientId: request?.account?.id,
      lng: request.body.lng,
      lat: request.body.lat,
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

export function setCaregiverLocation() {
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
    const location = await db.locations.findOne({
      caregiverId: request?.account?.id,
      lng: request.body.lng,
      lt: request.body.lat,
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
