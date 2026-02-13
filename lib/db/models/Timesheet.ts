import mongoose, { Schema, model, models } from 'mongoose'

const TimesheetSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: Date,
    checkOut: Date,
    hoursWorked: {
      type: Number,
      default: 0,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'leave', 'half-day'],
      default: 'present',
    },
    leaveType: {
      type: String,
      enum: ['sick', 'casual', 'vacation'],
    },
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Timesheet
}

export const Timesheet = mongoose.models.Timesheet || model('Timesheet', TimesheetSchema)
