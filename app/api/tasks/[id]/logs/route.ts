import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { TaskTimeLog, Employee } from '@/lib/db/models'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const logs = await TaskTimeLog.find({ taskId: id })
      .populate('employeeId', 'firstName lastName')
      .sort({ date: -1 })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching task logs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()
    
    // Check if a log already exists for this task
    const existingLog = await TaskTimeLog.findOne({ taskId: id })
    if (existingLog) {
      return NextResponse.json({ error: 'Hours have already been logged for this task' }, { status: 400 })
    }

    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 })
    }

    const log = await TaskTimeLog.create({
      taskId: id,
      employeeId: employee._id,
      hours: body.hours,
      date: body.date || new Date(),
      description: body.description,
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating task log:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
