import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { WFH } from '@/lib/db/models/WFH'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()
    
    await connectDB()

    const wfh = await WFH.findById(id)
    if (!wfh) {
      return NextResponse.json({ error: 'WFH request not found' }, { status: 404 })
    }

     // Multi-stage approval logic
     if (session.user.role === 'super_admin') {
      if (data.status === 'approved') {
        // Basic validation for existing/legacy records
        if (!wfh.startDate || isNaN(new Date(wfh.startDate).getTime())) {
          return NextResponse.json({ error: 'Cannot approve WFH with invalid start date. Please update or delete this request.' }, { status: 400 })
        }

        wfh.status = 'approved'
        wfh.approvedBy = session.user.id
        wfh.approvalDate = new Date()
      } else if (data.status === 'rejected') {
        wfh.status = 'rejected_admin'
      }
      wfh.notes = data.notes
    } else if (session.user.role === 'hr') {
      if (data.status === 'approved') {
        wfh.status = 'pending_admin'
      } else if (data.status === 'rejected') {
        wfh.status = 'rejected_hr'
      }
      wfh.notes = data.notes
    } else {
      if (!['pending_hr', 'pending_admin'].includes(wfh.status)) {
        return NextResponse.json({ error: 'Only pending requests can be cancelled' }, { status: 400 })
      }
      if (data.status === 'cancelled') {
        wfh.status = 'cancelled'
      } else {
        return NextResponse.json({ error: 'Unauthorized action' }, { status: 401 })
      }
    }

    await wfh.save()
    return NextResponse.json(wfh)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const wfh = await WFH.findById(id)
    if (!wfh) {
      return NextResponse.json({ error: 'WFH request not found' }, { status: 404 })
    }

    // Only allow deletion of pending requests by the owner or admin
    if (!['pending_hr', 'pending_admin'].includes(wfh.status) && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete processed requests' }, { status: 400 })
    }

    await WFH.findByIdAndDelete(id)
    return NextResponse.json({ message: 'WFH request deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
