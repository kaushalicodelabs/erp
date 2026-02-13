import connectDB from '@/lib/db/mongodb'
import { Notification } from '@/lib/db/models/Notification'
import mongoose from 'mongoose'

interface NotificationParams {
  recipient: string | mongoose.Types.ObjectId
  sender: string | mongoose.Types.ObjectId
  type: 'leave' | 'wfh' | 'task' | 'interview' | 'feedback' | 'system'
  title: string
  message: string
  link?: string
}

export async function sendNotification({
  recipient,
  sender,
  type,
  title,
  message,
  link
}: NotificationParams) {
  try {
    await connectDB()
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link
    })
    return notification
  } catch (error) {
    console.error('Failed to send notification:', error)
    return null
  }
}
