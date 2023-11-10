import express from 'express'
import fs, { PathLike } from 'node:fs'
import * as AWS from 'aws-sdk'
import '../../aws/aws'
import { StatusCodes } from 'http-status-codes'
import { HTTPRequest } from '@/adapters/express-callback'

const s3 = new AWS.S3()

async function uploadToS3(params: AWS.S3.PutObjectRequest) {
	return new Promise((resolve, reject) => {
		s3.upload(params, (err, data) => {
			if (err) {
				reject({
					statusCode: StatusCodes.BAD_REQUEST,
					body: {
						data: null,
						error: err.message,
						message: 'S3 upload failed',
					},
				})
			} else {
				resolve({
					statusCode: StatusCodes.OK,
					body: {
						data: `File upload: ${data.Location}`,
						error: null,
						message: 'S3 upload successful',
					},
				})
			}
		})
	})
}

export async function uploadFiles() {
	return function (req: HTTPRequest<object>) {
		const request = req as unknown as express.Request
		const originalname = request.file?.originalname

		if (!originalname) {
			return {
				statusCode: StatusCodes.OK,
				body: {
					data: null,
					error: 'File has no originalname',
					message: 'S3 upload failed',
				},
			}
		} else {
			const params: AWS.S3.PutObjectRequest = {
				Bucket: 'your-s3-bucket-name',
				Key: originalname,
				Body: fs.createReadStream(request.file?.path as unknown as PathLike),
			}

			const result = uploadToS3(params)
				.then(result => result)
				.catch(err => {
					return {
						statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
						body: {
							data: null,
							error: err,
							message: 'S3 upload failed',
						},
					}
				})
			return result
		}
	}
}
