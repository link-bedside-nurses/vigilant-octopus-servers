import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "@/database";
import { createToken } from "@/token/token";
import argon2 from "argon2";
import { Document } from "mongoose";

export function signupPatient() {
  return async function (
    request: HTTPRequest<
      object,
      {
        phone: string;
        password: string;
        firstName: string;
        lastName: string;
      }
    >,
  ) {
    const user = await db.patients.findOne({ phone: request.body.phone });

    if (user) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          message: "Phone number in use",
          data: null,
        },
      };
    }

    const newUser = await db.patients.create({
      phone: request.body.phone,
      password: request.body.password,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
    });

    await newUser.save();

    const token = createToken(newUser as Document & { phone: string });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: newUser,
        token,
        message: "Patient account created",
      },
    };
  };
}

export function signupAdmin() {
  return async function (
    request: HTTPRequest<
      object,
      {
        phone: string;
        password: string;
        firstName: string;
        lastName: string;
      }
    >,
  ) {
    const user = await db.admins.findOne({ phone: request.body.phone });

    if (user) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          message: "Phone number in use",
          data: null,
        },
      };
    }

    const newUser = await db.admins.create({
      firstName: request.body.firstName,
      lastName: request.body.lastName,
      phone: request.body.phone,
      password: request.body.password,
    });

    await newUser.save();

    const token = createToken(newUser as Document & { phone: string });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: newUser,
        token,
        message: "Admin account created",
      },
    };
  };
}

export function signupCaregiver() {
  return async function (
    request: HTTPRequest<
      object,
      {
        phone: string;
        password: string;
        firstName: string;
        lastName: string;
      }
    >,
  ) {
    const user = await db.caregivers.findOne({ phone: request.body.phone });

    if (user) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          message: "Phone number in use",
          data: null,
        },
      };
    }

    const newUser = await db.caregivers.create({
      phone: request.body.phone,
      password: request.body.password,
      firstName: request.body.firstName,
      lastName: request.body.lastName,
    });

    await newUser.save();

    const token = createToken(newUser as Document & { phone: string });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: newUser,
        token,
        message: "Caregivers account created",
      },
    };
  };
}

export function signinPatient() {
  return async function (
    request: HTTPRequest<object, { phone: string; password: string }>,
  ) {
    const user = await db.patients.findOne({ phone: request.body.phone });

    if (!user) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: {
          message: "Invalid Credentials",
          data: null,
        },
      };
    }

    const token = createToken(user as Document & { phone: string });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: user,
        token,
        message: "Signed in",
      },
    };
  };
}

export function signinAdmin() {
  return async function (
    request: HTTPRequest<object, { phone: string; password: string }>,
  ) {
    const user = await db.admins.findOne({ phone: request.body.phone });

    if (!user) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: {
          message: "Invalid Credentials",
          data: null,
        },
      };
    }

    const passwordsMatch = await argon2.verify(
      user.password,
      request.body.password,
    );

    if (!passwordsMatch) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: {
          data: null,
          message: "Invalid Credentials",
        },
      };
    }

    const token = createToken(user as Document & { phone: string });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: user,
        token,
        message: "Signed in",
      },
    };
  };
}

export function signinCaregiver() {
  return async function (
    request: HTTPRequest<object, { phone: string; password: string }>,
  ) {
    const user = await db.caregivers.findOne({ phone: request.body.phone });

    if (!user) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: {
          message: "Invalid Credentials",
          data: null,
        },
      };
    }

    const token = createToken(user as Document & { phone: string });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: user,
        token,
        message: "Signed in",
      },
    };
  };
}
