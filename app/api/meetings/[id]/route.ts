import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Meeting } from '@/lib/db/models'

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
    const meeting = await Meeting.findById(id)
      .populate('participants', 'firstName lastName position email')
      .populate('createdBy', 'name')

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Error fetching meeting:', error)
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

    const meeting = await Meeting.findById(id)
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Role-based logic
    const isSuperAdmin = session.user.role === 'super_admin'
    const isCreator = String(meeting.createdBy) === String(session.user.id)

    // Allowed updates
    let updateData: any = {}

    // Only Super Admin can add/edit MOM
    if ('mom' in body) {
      if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Only Super Admin can add MOM' }, { status: 403 })
      }
      updateData.mom = body.mom
      // Auto-set status to completed if MOM is added? Or let user decide.
      // Usually, MOM implies the meeting is finished.
      if (meeting.status === 'scheduled') {
        updateData.status = 'completed'
      }
    }

    // Creator or Super Admin can cancel/complete
    if (body.status) {
      if (!isSuperAdmin && !isCreator) {
        return NextResponse.json({ error: 'Unauthorized to update status' }, { status: 403 })
      }
      updateData.status = body.status
    }

    // Allow updating other fields if creator
    if (isCreator && meeting.status === 'scheduled') {
      if (body.title) updateData.title = body.title
      if (body.description) updateData.description = body.description
      if (body.date) updateData.date = body.date
      if (body.participants) updateData.participants = body.participants
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(id, updateData, { new: true })
      .populate('participants', 'firstName lastName position')
      .populate('createdBy', 'name')

    return NextResponse.json(updatedMeeting)
  } catch (error) {
    console.error('Error updating meeting:', error)
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const meeting = await Meeting.findById(id)
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Only creator or Super Admin can delete
    if (session.user.role !== 'super_admin' && String(meeting.createdBy) !== String(session.user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await Meeting.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Meeting deleted successfully' })
  } catch (error) {
    console.error('Error deleting meeting:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
