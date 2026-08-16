import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

interface IUser {
  fullName: string
  email: string
  password: string
  role: 'Lister' | 'Seeker'
  isAdmin: boolean
}

interface IUserMethods {
  generateAuthToken(): string
}

type UserDocument = mongoose.HydratedDocument<IUser, IUserMethods>

const UserSchema = new mongoose.Schema<
  IUser,
  mongoose.Model<IUser, {}, IUserMethods>
>({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Lister', 'Seeker'],
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

UserSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullName: this.fullName,
      role: this.role,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '12h' },
  )
}

const User = mongoose.model<IUser, mongoose.Model<IUser, {}, IUserMethods>>(
  'User',
  UserSchema,
)

export { User }
