import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Interview } from '@/lib/db/models/Interview'
import { Employee } from '@/lib/db/models/Employee'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, ...rest } = await req.json()
    await connectDB()

    const interview = await Interview.findById(id)
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 })
    }

    // Map user to employee
    const employee = await Employee.findOne({ userId: session.user.id })

    // Check permissions: only HR, Admin or the interviewer themselves
    const isInterviewer = employee && interview.interviewer.toString() === employee._id.toString()
    const canUpdate = ['super_admin', 'hr'].includes(session.user.role) || isInterviewer

    if (!canUpdate) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      { status, ...rest },
      { new: true }
    ).populate('interviewer', 'firstName lastName email')

    return NextResponse.json(updatedInterview)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
