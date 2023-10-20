import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "@/database";

export function getSessions() {
  return async function (request: HTTPRequest<object, object>) {
    const designation = request.account?.designation;
    let sessions;
    if (designation === "PATIENT") {
      sessions = await db.sessions.findOne({
        patientId: request.account?.id,
      });
    } else if (designation === "CAREGIVER") {
      sessions = await db.sessions.findOne({
        patientId: request.account?.id,
      });
    } else {
      return {
        statusCode: StatusCodes.OK,
        body: {
          data: null,
          message: "Only patients and caregivers can query for sessions",
        },
      };
    }

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: sessions,
        message: "sessions retrieved",
      },
    };
  };
}

export function confirmSession() {
  return async function (request: HTTPRequest<{ id: string }, object>) {
    const session = await db.sessions.findById(request.params.id);

    if (!session) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message:
            "Could not confirm session. This session has not been setup or initiated by anyone",
        },
      };
    }

    await session.confirmSession();

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: session,
        message: "Session has been confirmed and initiated",
      },
    };
  };
}

export function cancelSession() {
  return async function (
    request: HTTPRequest<
      { id: string },
      {
        reason?: string;
      }
    >,
  ) {
    const session = await db.sessions.findById(request.params.id);

    if (!session) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message:
            "Could not cancel session. This session has not been setup or initiated by anyone",
        },
      };
    }

    await session.cancelSession(request.body.reason);

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: session,
        message: "Session has been confirmed and initiated",
      },
    };
  };
}

export function getSession() {
  return async function (
    request: HTTPRequest<
      { id: string },
      {
        reason?: string;
      }
    >,
  ) {
    const session = await db.sessions.findById(request.params.id);

    if (!session) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message:
            "Could not get session. This session has not been setup or initiated by anyone",
        },
      };
    }

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: session,
        message: "Session has been confirmed and initiated",
      },
    };
  };
}
