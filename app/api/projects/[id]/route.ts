import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Project, Employee } from '@/lib/db/models'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session || session.user?.role === 'hr') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    let queryBuilder = Project.findById(id)

    if (session.user.role !== 'super_admin') {
      queryBuilder = queryBuilder.select('-budget')
    }

    const project = await queryBuilder
      .populate('clientId', 'companyName')
      .populate('projectManager', 'firstName lastName position')
      .populate('assignedEmployees', 'firstName lastName position')
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
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
    if (!session || !['super_admin', 'project_manager'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const project = await Project.findById(id)
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Secure Authorization:
    // Super Admin can do anything.
    // Project Manager can only update if they are the assigned PM for this project.
    if (session.user.role === 'project_manager') {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee || project.projectManager.toString() !== employee._id.toString()) {
        return NextResponse.json({ error: 'Unauthorized: You are not the manager of this project' }, { status: 403 })
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(id, body, { returnDocument: 'after' })
      .populate('clientId', 'companyName')
      .populate('projectManager', 'firstName lastName position')
      .populate('assignedEmployees', 'firstName lastName position')
    
    if (!updatedProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    let responseData = updatedProject.toObject()
    if (session.user.role !== 'super_admin') {
      delete responseData.budget
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error updating project:', error)
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
    if (!session || session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const project = await Project.findByIdAndDelete(id)
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
