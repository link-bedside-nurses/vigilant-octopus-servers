import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";

export function ping() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function (_: HTTPRequest<object, object>) {
    return {
      statusCode: StatusCodes.OK,
      body: {
        data: null,
        message: "pong",
      },
    };
  };
}

export function error() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function (_: HTTPRequest<object, object>) {
    throw new Error("Something went wrong!");
  };
}
