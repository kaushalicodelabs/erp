import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Notification } from '@/lib/db/models/Notification'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = page * limit

    await connectDB()

    const total = await Notification.countDocuments({ recipient: session.user.id })
    const notifications = await Notification.find({ recipient: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name')

    const unreadCount = await Notification.countDocuments({ 
      recipient: session.user.id, 
      isRead: false 
    })

    return NextResponse.json({
      notifications,
      total,
      unreadCount,
      pageCount: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Mark all as read
export async function PATCH() {
  try {
    const session = await auth()
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    await Notification.updateMany(
      { recipient: session.user.id, isRead: false },
      { $set: { isRead: true } }
    )

    return NextResponse.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
