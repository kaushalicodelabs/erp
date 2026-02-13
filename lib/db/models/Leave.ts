import mongoose, { Schema, model, models } from 'mongoose'

const LeaveSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    type: {
      type: String,
      enum: ['sick_full', 'casual_full', 'sick_half', 'casual_half', 'short', 'unpaid', 'other', 'wfh'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    // ... rest of the fields
    status: {
      type: String,
      enum: ['pending_hr', 'pending_admin', 'approved', 'rejected_hr', 'rejected_admin', 'cancelled'],
      default: 'pending_hr',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvalDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Leave
}

export const Leave = mongoose.models.Leave || model('Leave', LeaveSchema)
