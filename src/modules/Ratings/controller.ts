import { HTTPRequest } from "@/adapters/express-callback";
import { StatusCodes } from "http-status-codes";
import { db } from "@/database";

export function getRatings() {
  return async function (
    request: HTTPRequest<
      {
        caregiverId: string;
      },
      object,
      object
    >,
  ) {
    const ratings = await db.ratings.findOne({
      caregiverId: request.params.caregiverId,
    });

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: ratings,
        message: "Rating retrieved",
      },
    };
  };
}

export function getSingleRating() {
  return async function (
    request: HTTPRequest<
      {
        ratingId: string;
      },
      object,
      object
    >,
  ) {
    const rating = await db.ratings.findById(request.params.ratingId);

    if (!rating) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        body: {
          data: null,
          message: "Not Rating found",
        },
      };
    }

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: rating,
        message: "Rating retrieved",
      },
    };
  };
}

export function addRating() {
  return async function (
    request: HTTPRequest<
      object,
      {
        caregiverId: string;
        value: number;
        description: string;
      },
      object
    >,
  ) {
    const { description, value, caregiverId } = request.body;

    if (!description || !value || !caregiverId) {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          data: null,
          message: "All fields must be sent",
        },
      };
    }

    const rating = await db.ratings.create({
      description,
      value,
      caregiverId,
      patientId: request?.account?.id,
    });

    await rating.save();

    return {
      statusCode: StatusCodes.OK,
      body: {
        data: rating,
        message: "Rating retrieved",
      },
    };
  };
}
