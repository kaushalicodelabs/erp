import mongoose, { Schema, model, models } from 'mongoose'

const SalarySchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
      unique: true, // One salary record per employee
    },
    baseSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    paymentFrequency: {
      type: String,
      enum: ['monthly', 'bi-weekly', 'weekly'],
      default: 'monthly',
    },
    bonuses: [
      {
        amount: Number,
        reason: String,
        date: { type: Date, default: Date.now },
      }
    ],
    deductions: [
      {
        amount: Number,
        reason: String,
        date: { type: Date, default: Date.now },
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastIncrementDate: Date,
    bankDetails: {
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    }
  },
  {
    timestamps: true,
  }
)

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Salary
}

export const Salary = mongoose.models.Salary || model('Salary', SalarySchema)
