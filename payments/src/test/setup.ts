import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer

// Mock the NATS client 

jest.mock('../nats-client')

// Mock stripe

jest.mock('../stripe')

// Set missing environment variables and create an in memory MongoDB instance

beforeAll(async () => {
  process.env.JWT_SECRET_KEY = 'JWT_SECRET_KEY'
  mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri()
  await mongoose.connect(mongoUri, {})
})

// Delete all collections in our in memory MongoDB instance

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()
  await Promise.all(collections.map(collection => collection.deleteMany({})))
})

// Cleanup by stopping in memory MongoDB instance and disconnecting mongoose client

afterAll(async () => {
  if (mongo) {
    await mongo.stop()
  }
  await mongoose.connection.close()
})

// Global helpers

const EMAIL = 'email@domain.com'

declare global {
  var signin: (id?: string) => string[]
}

signin = (id?: string) => {
  const token = jwt.sign({ id: id || new mongoose.Types.ObjectId().toHexString(), email: EMAIL }, process.env.JWT_SECRET_KEY)
  const session = JSON.stringify({ jwt: token })
  const base64 = Buffer.from(session).toString('base64')
  return [`session=${base64}`]
}