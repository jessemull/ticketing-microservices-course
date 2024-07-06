import app from '../app'
import mongoose from 'mongoose'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer

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
const PASSWORD = 'password'

declare global {
  namespace NodeJS {
    export interface Global {
      signup(): Promise<string[]>;
    }
  }
}

global.signup = async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: EMAIL,
      password: PASSWORD
    })
    .expect(201)

  const cookie = response.get('Set-Cookie')
  
  return cookie
}