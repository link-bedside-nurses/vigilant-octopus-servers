import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "@/database";

export function getPatientSessions() {
  return async function (request: HTTPRequest<object, object>) {
    const sessions = await db.sessions.findOne({ patientId: request.account?.id });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: sessions,
        message: "Patients sessions retrieved successfully",
      },
    };
  };
}

export function getCaregiverSessions() {
  return async function (request: HTTPRequest<object, object>) {
    const sessions = await db.sessions.findOne({ caregiverId: request.account?.id });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: sessions,
        message: "Patients sessions retrieved successfully",
      },
    };
  };
}

export function confirmSession() {
  return async function (request: HTTPRequest<{ id:string }, object>) {
    const session = await db.sessions.findById(request.params.id)

    if(!session){
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message: "Could not confirm session. This session has not been setup or initiated by anyone",
        },
      };
    }

    await session.confirmSession()

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
  return async function (request: HTTPRequest<{ id:string },{
    reason?:string
  }>) {
    const session = await db.sessions.findById(request.params.id)

    if(!session){
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message: "Could not cancel session. This session has not been setup or initiated by anyone",
        },
      };
    }

    await session.cancelSession(request.body.reason)

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: session,
        message: "Session has been confirmed and initiated",
      },
    };
  };
}

export function getSession(){
  return async function (request: HTTPRequest<{ id:string },{
    reason?:string
  }>) {
    const session = await db.sessions.findById(request.params.id)

    if(!session){
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message: "Could not get session. This session has not been setup or initiated by anyone",
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