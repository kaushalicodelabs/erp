import mongoose, { Schema, model } from 'mongoose'

const InterviewFeedbackSchema = new Schema(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    round: {
      type: Number,
      required: true,
      default: 1,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    technicalSkills: String,
    softSkills: String,
    culturalFit: String,
    recommendation: {
      type: String,
      enum: ['Hire', 'Strong Hire', 'Reject', 'Hold'],
      required: true,
    },
    overallNotes: String,
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.InterviewFeedback
}

export const InterviewFeedback = mongoose.models.InterviewFeedback || model('InterviewFeedback', InterviewFeedbackSchema)
