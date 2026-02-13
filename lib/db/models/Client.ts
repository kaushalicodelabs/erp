import mongoose, { Schema, model, models } from 'mongoose'

const ClientSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    contactPerson: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: String,
    website: String,
    industry: String,
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Client
}

export const Client = mongoose.models.Client || model('Client', ClientSchema)
