import mongoose, { Schema, Document } from 'mongoose'

export interface IPayment extends Document {
  invoiceId: mongoose.Types.ObjectId
  amount: number
  date: Date
  method: 'bank_transfer' | 'cash' | 'check' | 'online'
  reference?: string
  notes?: string
  status: 'completed' | 'pending' | 'failed'
  createdAt: Date
}

const PaymentSchema: Schema = new Schema({
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  method: { 
    type: String, 
    enum: ['bank_transfer', 'cash', 'check', 'online'], 
    required: true,
    default: 'bank_transfer'
  },
  reference: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['completed', 'pending', 'failed'], 
    default: 'completed' 
  },
  createdAt: { type: Date, default: Date.now }
})

// Fix for hot-reloading in Next.js
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Payment
}

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
