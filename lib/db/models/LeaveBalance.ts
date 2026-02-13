import mongoose, { Schema, model, models } from 'mongoose'

const LeaveBalanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number, // 0-11
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    fullDay: {
      quota: { type: Number, default: 1 },
      used: { type: Number, default: 0 },
      carriedForward: { type: Number, default: 0 },
    },
    halfDay: {
      quota: { type: Number, default: 2 },
      used: { type: Number, default: 0 },
      carriedForward: { type: Number, default: 0 },
    },
    short: {
      quota: { type: Number, default: 1 },
      used: { type: Number, default: 0 },
      // Short leaves do not carry forward
    },
  },
  {
    timestamps: true,
  }
)

// Ensure unique balance per employee per month
LeaveBalanceSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true })

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.LeaveBalance
}

export const LeaveBalance = mongoose.models.LeaveBalance || model('LeaveBalance', LeaveBalanceSchema)
