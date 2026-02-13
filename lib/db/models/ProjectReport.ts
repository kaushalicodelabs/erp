import mongoose, { Schema, model } from 'mongoose'

const ProjectReportSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    reportDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['on-track', 'at-risk', 'delayed', 'completed'],
      default: 'on-track',
    },
    summary: {
      type: String,
      required: true,
    },
    achievements: {
      type: String,
    },
    blockers: {
      type: String,
    },
    nextSteps: {
      type: String,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
    }
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.ProjectReport
}

export const ProjectReport = mongoose.models.ProjectReport || model('ProjectReport', ProjectReportSchema)
export default ProjectReport
