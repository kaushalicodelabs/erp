import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Interview } from '@/lib/db/models/Interview'
import { InterviewFeedback } from '@/lib/db/models/InterviewFeedback'
import { Employee } from '@/lib/db/models/Employee'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    await connectDB()

    const interview = await Interview.findById(id).populate('interviewer')
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Map user to employee
    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee && !['super_admin', 'hr'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 })
    }

    // Check if user is the interviewer
    const isInterviewer = employee && interview.interviewer && (interview.interviewer._id || interview.interviewer).toString() === employee._id.toString()
    const isAdmin = ['super_admin', 'hr'].includes(session.user.role)

    if (!isInterviewer && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedback = await InterviewFeedback.create({
      ...data,
      interviewId: id,
      interviewerId: employee?._id || interview.interviewer, // Fallback to assigned interviewer ID if admin
      round: interview.round
    })

    // Update interview status to under_review until HR/Admin takes action.
    await Interview.findByIdAndUpdate(id, { status: 'under_review' })

    return NextResponse.json(feedback)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const feedback = await InterviewFeedback.find({ interviewId: id })
      .populate('interviewerId', 'firstName lastName email profilePhoto')
      .sort({ createdAt: -1 })

    return NextResponse.json(feedback)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
