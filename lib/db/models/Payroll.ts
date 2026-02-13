import mongoose, { Schema, model, models } from 'mongoose'

const PayrollSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: {
      type: Number, // 1-12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    bonuses: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netPayable: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentDate: Date,
    transactionId: String,
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Ensure unique payroll per employee per month/year
PayrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true })

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Payroll
}

export const Payroll = mongoose.models.Payroll || model('Payroll', PayrollSchema)
