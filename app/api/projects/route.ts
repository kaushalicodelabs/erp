import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Project } from '@/lib/db/models/Project'
import { User } from '@/lib/db/models/User'
import { Employee } from '@/lib/db/models/Employee'
import { Client } from '@/lib/db/models/Client'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = page * limit
    const search = searchParams.get('search') || ''
    const clientIdFilter = searchParams.get('clientId')

    await connectDB()

    let query: any = {}

    // Visibility Logic:
    // HR is explicitly blocked from projects.
    if (session.user.role === 'hr') {
      return NextResponse.json({ error: 'Unauthorized: HR cannot view projects' }, { status: 403 })
    }

    if (session.user.role !== 'super_admin') {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ projects: [], total: 0, pageCount: 0 })
      }
      query = {
        $or: [
          { projectManager: employee._id },
          { assignedEmployees: { $in: [employee._id] } }
        ]
      }
    }

    if (search) {
      query.$or = query.$or || []
      query.$or.push(
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      )
    }

    if (clientIdFilter) {
      query.clientId = clientIdFilter
    }

    const total = await Project.countDocuments(query)
    let queryBuilder = Project.find(query)

    if (session.user.role !== 'super_admin') {
      queryBuilder = queryBuilder.select('-budget')
    }

    const projects = await queryBuilder
      .populate('clientId', 'companyName')
      .populate('projectManager', 'firstName lastName position')
      .populate('assignedEmployees', 'firstName lastName position')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      projects,
      total,
      pageCount: Math.ceil(total / limit)
    })
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

    let responseData = project.toObject()
    if (session.user.role !== 'super_admin') {
      delete responseData.budget
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
