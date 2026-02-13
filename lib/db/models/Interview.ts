import mongoose, { Schema, model } from 'mongoose'

const InterviewSchema = new Schema(
  {
    candidateName: {
      type: String,
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    interviewer: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    location: String,
    meetingLink: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'rejected', 'under_review'],
      default: 'scheduled',
    },
    type: {
      type: String,
      enum: ['Technical', 'HR', 'Managerial', 'Final'],
      required: true,
    },
    round: {
      type: Number,
      required: true,
      default: 1,
    },
    notes: String,
    resumeUrl: String,
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Interview
}

export const Interview = mongoose.models.Interview || model('Interview', InterviewSchema)
