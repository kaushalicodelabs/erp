import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { ProjectReport, Employee, Project } from '@/lib/db/models'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    let query: any = {}
    if (projectId) query.projectId = projectId

    const reports = await ProjectReport.find(query)
      .populate('submittedBy', 'firstName lastName position')
      .populate('projectId', 'name')
      .sort({ reportDate: -1 })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching project reports:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 403 })
    }

    const report = await ProjectReport.create({
      ...body,
      submittedBy: employee._id
    })

    // Update project progress if provided in report
    if (body.progress !== undefined) {
      await Project.findByIdAndUpdate(body.projectId, { progress: body.progress })
    }

    const populatedReport = await ProjectReport.findById(report._id)
      .populate('submittedBy', 'firstName lastName position')
      .populate('projectId', 'name')

    return NextResponse.json(populatedReport, { status: 201 })
  } catch (error) {
    console.error('Error submitting project report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
