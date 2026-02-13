import mongoose, { Schema, model } from 'mongoose'

const TaskTimeLogSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    hours: {
      type: Number,
      required: true,
      min: 0.1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.TaskTimeLog
}

export const TaskTimeLog = mongoose.models.TaskTimeLog || model('TaskTimeLog', TaskTimeLogSchema)
export default TaskTimeLog
