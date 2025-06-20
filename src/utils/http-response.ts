import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { TResponse } from '../interfaces/dtos';

export const normalizedResponse = (
	statusCode: StatusCodes,
	data: object | null,
	message: string,
	validationError?: ZodError
): TResponse => {
	const zodError = validationError?.issues;
	return {
		statusCode,
		body: {
			data,
			error: zodError,
			message,
		},
	};
};
