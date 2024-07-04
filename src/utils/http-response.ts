import { StatusCodes } from 'http-status-codes';
import { TResponse } from '../interfaces/dtos';

export const response = (
	statusCode: StatusCodes,
	data: object | null,
	message: string
): TResponse => {
	return {
		statusCode,
		body: {
			data,
			message,
		},
	};
};
