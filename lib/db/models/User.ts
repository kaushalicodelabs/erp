import mongoose, { Schema, model, models } from 'mongoose'

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        'super_admin',
        'hr',
        'project_manager',
        'graphic_designer',
        'associate_software_developer',
        'software_developer',
        'senior_software_developer'
      ],
      default: 'software_developer',
    },
    avatar: String,
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User
}

export const User = mongoose.models.User || model('User', UserSchema)
