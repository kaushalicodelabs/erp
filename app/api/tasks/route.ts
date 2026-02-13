import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Task, Project, Employee, TaskTimeLog, User } from '@/lib/db/models'
import { sendNotification } from '@/lib/utils/notification-utils'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const employeeId = searchParams.get('employeeId')

    let query: any = {}
    if (projectId) query.projectId = projectId
    if (employeeId) query.assigneeId = employeeId

    // If not admin/pm, can only see their own tasks
    if (['super_admin', 'hr', 'project_manager'].indexOf(session.user.role) === -1) {
       const employee = await Employee.findOne({ userId: session.user.id })
       if (employee) {
         query.assigneeId = employee._id
       } else {
         return NextResponse.json([])
       }
    }

    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = page * limit

    const total = await Task.countDocuments(query)
    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('assigneeId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Add hasLog status to each task
    const taskIds = tasks.map(t => t._id)
    const logs = await TaskTimeLog.find({ taskId: { $in: taskIds } }, 'taskId')
    const loggedTaskIds = new Set(logs.map(l => l.taskId.toString()))

    const tasksWithLogStatus = tasks.map(t => ({
      ...t,
      hasLog: loggedTaskIds.has(t._id.toString())
    }))

    return NextResponse.json({
      tasks: tasksWithLogStatus,
      total,
      pageCount: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user?.role !== 'super_admin' && session.user?.role !== 'project_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const task = await Task.create({
      ...body,
      createdBy: session.user.id
    })

    // Send Notification to Assignee
    const employee = await Employee.findById(body.assigneeId)
    if (employee && employee.userId) {
      await sendNotification({
        recipient: employee.userId.toString(),
        sender: session.user.id,
        type: 'task',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${body.title}`,
        link: '/projects/tasks'
      })
    }

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
