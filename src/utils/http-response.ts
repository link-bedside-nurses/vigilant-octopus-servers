import { StatusCodes } from 'http-status-codes';
import { TResponse } from '../interfaces/dtos';
import { ZodError } from 'zod';

export const response = (
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
