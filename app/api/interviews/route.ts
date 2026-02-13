import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Interview } from '@/lib/db/models/Interview'
import { Employee } from '@/lib/db/models/Employee'
import { sendNotification } from '@/lib/utils/notification-utils'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = page * limit

    const query: any = {}
    if (status && status !== 'all') {
      query.status = status
    }

    // Role-based filtering (Standard users only see their own assigned interviews)
    if (!['super_admin', 'hr'].includes(session.user.role)) {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ interviews: [], total: 0, pageCount: 0 })
      }
      query.interviewer = employee._id
    }

    const total = await Interview.countDocuments(query)
    const interviews = await Interview.find(query)
      .populate('interviewer', 'firstName lastName email profilePhoto userId')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit)

    const pageCount = Math.ceil(total / limit)

    return NextResponse.json({ interviews, total, pageCount })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['super_admin', 'hr'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    await connectDB()

    const interview = await Interview.create(data)

    // Send Notification to Interviewer
    const interviewer = await Employee.findById(data.interviewer)
    if (interviewer && interviewer.userId) {
      await sendNotification({
        recipient: interviewer.userId.toString(),
        sender: session.user.id,
        type: 'interview',
        title: 'New Interview Scheduled',
        message: `You have been scheduled to interview ${data.candidateName} for the role of ${data.role}.`,
        link: '/interviews'
      })
    }
    
    const populatedInterview = await Interview.findById(interview._id)
      .populate('interviewer', 'firstName lastName email')

    return NextResponse.json(populatedInterview)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
