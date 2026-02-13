import mongoose, { Schema, model, models } from 'mongoose'

const WFHSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
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
  delete mongoose.models.WFH
}

export const WFH = mongoose.models.WFH || model('WFH', WFHSchema)
