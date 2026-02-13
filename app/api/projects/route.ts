import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Project } from '@/lib/db/models/Project'
import { User } from '@/lib/db/models/User'
import { Employee } from '@/lib/db/models/Employee'
import { Client } from '@/lib/db/models/Client'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    let query: any = {}

    // Visibility Logic:
    // Super Admin and HR can see all projects.
    // Others only see projects they are assigned to (as PM or Employee).
    if (!['super_admin', 'hr'].includes(session.user.role)) {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ projects: [] }) // No employee profile, no projects
      }
      query = {
        $or: [
          { projectManager: employee._id },
          { assignedEmployees: { $in: [employee._id] } }
        ]
      }
    }

    // Find all users who are NOT super_admin for PM population mapping
    const nonAdminUsers = await User.find({ role: { $ne: 'super_admin' } }, '_id')
    const nonAdminUserIds = nonAdminUsers.map((u: any) => u._id)
    
    // Find employees linked to non-admin users
    const nonAdminEmployees = await Employee.find({ userId: { $in: nonAdminUserIds } }, '_id')
    const nonAdminEmployeeIds = nonAdminEmployees.map((e: any) => e._id)

    const projects = await Project.find(query)
      .populate('clientId', 'companyName')
      .populate({
        path: 'projectManager',
        match: { _id: { $in: nonAdminEmployeeIds } },
        select: 'firstName lastName'
      })
      .populate('assignedEmployees', 'firstName lastName')
      .sort({ createdAt: -1 })
    
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
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

    const project = await Project.create(body)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
