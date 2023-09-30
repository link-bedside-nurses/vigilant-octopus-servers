import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";

import handler from "../services/list-caregivers";

export default function makeGetCaregiversController() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return async function (_request: HTTPRequest) {
    const response = await handler();

    return {
      statusCode: StatusCodes.OK,
      body: { ...response },
    };
  };
}
