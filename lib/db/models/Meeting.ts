import mongoose, { Schema, model } from 'mongoose'

const MeetingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
      },
    ],
    mom: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Meeting
}

export const Meeting = mongoose.models.Meeting || model('Meeting', MeetingSchema)
export default Meeting
