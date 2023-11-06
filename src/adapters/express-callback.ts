/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import { IncomingHttpHeaders } from 'http'
import { DESIGNATION } from '@/interfaces'

export interface HTTPRequest<ParamsDictionary = any, RequestBody = any, QueryDictionary = any> {
	body: RequestBody
	query: QueryDictionary
	params: ParamsDictionary
	ip: string
	method: string
	path: string
	headers: IncomingHttpHeaders
	account?: { id?: string; designation: DESIGNATION; phone: string }
}

interface HTTPResponse {
	headers?: { [key: string]: string | undefined }
	body: any
	statusCode: number
}

export type ControllerCallbackHandler = (httpRequest: HTTPRequest) => Promise<HTTPResponse>

export default function makeCallback(controllerCallback: ControllerCallbackHandler) {
	return (request: express.Request, response: express.Response, next: express.NextFunction) => {
		const httpRequest = {
			body: request.body,
			query: request.query,
			params: request.params,
			ip: request.ip,
			method: request.method,
			path: request.path,
			headers: {
				...request.headers,
			},
			account: request.account,
		}

		controllerCallback(httpRequest)
			.then(httpResponse => {
				if (httpResponse.headers) {
					response.set(httpResponse.headers)
				}
				response.type('application/json')
				response.status(httpResponse.statusCode || 200).send({ ...httpResponse.body })
			})
			.catch(error => {
				return next(error)
			})
	}
}
