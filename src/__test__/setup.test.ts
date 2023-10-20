import { MongoMemoryServer } from 'mongodb-memory-server'
import { app } from '../index'
import mongoose from 'mongoose'
import request from 'supertest'

let mongod: MongoMemoryServer

beforeAll(async () => {
	mongod = await MongoMemoryServer.create()
	const uri = mongod.getUri()
	await mongoose.connect(uri)
})

beforeEach(async () => {
	jest.clearAllMocks()

	const collections = await mongoose.connection.db.collections()

	for (const collection of collections) {
		await collection.deleteMany({})
	}
})

afterAll(async () => {
	await mongod.stop({
		doCleanup: true,
		force: true,
	})

	await mongoose.connection.close()
})

it('should return a 200 on a GET request', async () => {
	await request(app).get('/test/ping').expect(200)

	const response = await request(app).get('/test/ping').expect(200)

	expect(response.body?.message).toEqual('pong')
})

it('should return a 500 internal server error', async () => {
	const response = await request(app).get('/test/error').expect(500)

	expect(response.body?.error).toEqual('Intended Exception')
})
