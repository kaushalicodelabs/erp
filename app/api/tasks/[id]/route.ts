import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Task, Employee } from '@/lib/db/models'

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
    const task = await Task.findById(id)
      .populate('projectId', 'name')
      .populate('assigneeId', 'firstName lastName')
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
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

    const task = await Task.findById(id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Role-based authorization and sequential status logic
    const isManager = session.user.role === 'super_admin' || session.user.role === 'project_manager'
    
    // Status transition map
    const statusOrder = ['todo', 'in-progress', 'review', 'completed']
    
    if (body.status && body.status !== task.status) {
      // 1. Only non-managers (Devs/Designers) can update status
      if (isManager) {
        return NextResponse.json({ error: 'Only assignees can update task status' }, { status: 403 })
      }

      // 2. Validate user is the assignee
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee || task.assigneeId.toString() !== employee._id.toString()) {
        return NextResponse.json({ error: 'Only the assigned developer can update the status' }, { status: 403 })
      }

      // 3. Enforce sequential transition
      const currentIndex = statusOrder.indexOf(task.status)
      const nextIndex = statusOrder.indexOf(body.status)
      
      if (nextIndex !== currentIndex + 1) {
        return NextResponse.json({ 
          error: `Invalid transition from ${task.status} to ${body.status}. Statuses must be updated one by one.` 
        }, { status: 400 })
      }
    }

    let updateData = body
    if (!isManager) {
      // If developer, they can ONLY update status
      updateData = { status: body.status }
    } else {
      // If manager, they can update everything EXCEPT status
      // Restricted: Can only edit task details while in 'todo' status
      if (task.status !== 'todo') {
        return NextResponse.json({ 
          error: 'Task details can only be edited while in "Todo" status. Once work starts, the definition is locked.' 
        }, { status: 400 })
      }
      const { status, ...rest } = body
      updateData = rest
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate('projectId', 'name')
      .populate('assigneeId', 'firstName lastName')

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || (session.user?.role !== 'super_admin' && session.user?.role !== 'project_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const task = await Task.findByIdAndDelete(id)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
