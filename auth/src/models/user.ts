import mongoose from 'mongoose'
import { Password } from '../services/password'

// Interface describing required properties to create a new user.

interface UserAttributes {
  email: string
  password: string
}

// Interface that describes the properties on a user model.

interface UserModel extends mongoose.Model<any> {
  build(user: UserAttributes): UserDocument
}

// Interface that describe the properties on a user document.

interface UserDocument extends mongoose.Document {
  email: string
  password: string
}

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.password
      delete ret.__v
    }
  }
})

schema.pre('save', async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

schema.statics.build = (user: UserAttributes) => {
  return new User(user)
}

const User = mongoose.model<UserDocument, UserModel>('User', schema)

export { User }