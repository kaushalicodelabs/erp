import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Leave } from '@/lib/db/models/Leave'
import { Employee } from '@/lib/db/models/Employee'
import { User } from '@/lib/db/models/User'
import { getOrCreateBalance, checkQuota, updateLeaveUsage } from '@/lib/utils/leave-utils'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    
    let query: any = {}
    
    // Visibility logic: Only HR and Super Admin see everything
    if (!['hr', 'super_admin'].includes(session.user.role)) {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 })
      }
      query.employeeId = employee._id
    } else {
      // HR/Super Admin: show all records for non-super_admin employees
      const nonAdminUsers = await User.find({ role: { $ne: 'super_admin' } }, '_id')
      const nonAdminUserIds = nonAdminUsers.map((u: any) => u._id)
      
      const nonAdminEmployees = await Employee.find({ userId: { $in: nonAdminUserIds } }, '_id')
      const nonAdminEmployeeIds = nonAdminEmployees.map((e: any) => e._id)
      query.employeeId = { $in: nonAdminEmployeeIds }
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'firstName lastName employeeId department')
      .sort({ createdAt: -1 })

    return NextResponse.json(leaves)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    await connectDB()

    // Ensure dates are valid
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid start or end date' }, { status: 400 })
    }

    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 })
    }

    // Role-based initial status
    const initialStatus = session.user.role === 'hr' ? 'pending_admin' : 'pending_hr'

    // Quota check for paid leaves
    if (['sick_full', 'casual_full', 'sick_half', 'casual_half', 'short'].includes(data.type)) {
      const hasQuota = await checkQuota(employee._id, data.type, new Date(data.startDate))
      if (!hasQuota) {
        return NextResponse.json({ error: `Monthly quota exceeded for ${data.type.replace('_', ' ')} leaves` }, { status: 400 })
      }
    }

    const leave = await Leave.create({
      ...data,
      employeeId: employee._id,
      status: initialStatus
    })

    return NextResponse.json(leave)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
