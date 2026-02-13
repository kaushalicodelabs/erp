import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  type: 'leave' | 'wfh' | 'task' | 'interview' | 'feedback' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['leave', 'wfh', 'task', 'interview', 'feedback', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

// Index for faster queries on recipient and read status
NotificationSchema.index({ recipient: 1, isRead: 1 })
NotificationSchema.index({ createdAt: -1 })

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
