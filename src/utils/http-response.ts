import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

export const normalizedResponse = (
	statusCode: StatusCodes,
	data: object | null,
	message: string,
	validationError?: ZodError
) => {
	const zodError = validationError?.issues;
	return {
		statusCode,
		data,
		error: zodError,
		message,
	};
};

export function sendNormalized(
	res: Response,
	statusCode: StatusCodes,
	data: any,
	message: string,
	validationError?: ZodError
) {
	return res
		.status(statusCode)
		.send(normalizedResponse(statusCode, data, message, validationError));
}
