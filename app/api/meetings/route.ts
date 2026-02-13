import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Meeting, Employee } from '@/lib/db/models'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query: any = {}
    if (status) query.status = status

    // Non-admin users can only see meetings they created or are participating in
    if (session.user.role !== 'super_admin') {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        // If no employee profile, user can only see meetings they created
        query.createdBy = session.user.id
      } else {
        query.$or = [
          { createdBy: session.user.id },
          { participants: employee._id }
        ]
      }
    }

    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = page * limit
    const search = searchParams.get('search') || ''

    if (search) {
      query.$or = query.$or || []
      query.$or.push(
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      )
    }

    const total = await Meeting.countDocuments(query)
    const meetings = await Meeting.find(query)
      .populate('participants', 'firstName lastName position')
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)

    return NextResponse.json({
      meetings,
      total,
      pageCount: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching meetings:', error)
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

    const meeting = await Meeting.create({
      ...body,
      createdBy: session.user.id
    })

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('participants', 'firstName lastName position')
      .populate('createdBy', 'name')

    return NextResponse.json(populatedMeeting, { status: 201 })
  } catch (error) {
    console.error('Error creating meeting:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
