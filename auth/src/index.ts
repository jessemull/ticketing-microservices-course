import app from './app'
import mongoose from 'mongoose'

const start = async () => {
  console.log('Starting auth server...')
  if (!process.env.JWT_SECRET_KEY) {
    throw new Error('JWT Secret key must be defined.')
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MongoDB URI must be defined.')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
  } catch (err) {
    console.error(err)
  }

  console.log('Connected to MongoDB...')
  
  app.listen(3000, () => {
    console.log('Listening on port 3000!')
  })
}

start()


