import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Leave } from '@/lib/db/models/Leave'
import { updateLeaveUsage } from '@/lib/utils/leave-utils'

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

    const leave = await Leave.findById(id)
    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    // Multi-stage approval logic
    if (session.user.role === 'super_admin') {
      // Super Admin can finally approve or reject anything
      if (data.status === 'approved') {
        // Basic validation for existing/legacy records
        if (!leave.startDate || isNaN(new Date(leave.startDate).getTime())) {
          return NextResponse.json({ error: 'Cannot approve leave with invalid start date. Please update or delete this request.' }, { status: 400 })
        }

        leave.status = 'approved'
        leave.approvedBy = session.user.id
        leave.approvalDate = new Date()
        
        // Update leave balance on final approval
        if (!['unpaid', 'other'].includes(leave.type)) {
          await updateLeaveUsage(leave.employeeId, leave.type, leave.startDate, true)
        }
      } else if (data.status === 'rejected') {
        leave.status = 'rejected_admin'
      }
      leave.notes = data.notes
    } else if (session.user.role === 'hr') {
      // HR can approve to Admin or reject
      if (data.status === 'approved') {
        leave.status = 'pending_admin'
      } else if (data.status === 'rejected') {
        leave.status = 'rejected_hr'
      }
      leave.notes = data.notes
    } else {
      // Employees can only cancel their own pending requests
      if (!['pending_hr', 'pending_admin'].includes(leave.status)) {
        return NextResponse.json({ error: 'Only pending requests can be cancelled' }, { status: 400 })
      }
      if (data.status === 'cancelled') {
        leave.status = 'cancelled'
      } else {
        return NextResponse.json({ error: 'Unauthorized action' }, { status: 401 })
      }
    }

    await leave.save()
    return NextResponse.json(leave)
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

    const leave = await Leave.findById(id)
    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    // Only allow deletion of pending requests by the owner or admin
    if (!['pending_hr', 'pending_admin'].includes(leave.status) && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Cannot delete processed requests' }, { status: 400 })
    }

    await Leave.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Leave request deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
