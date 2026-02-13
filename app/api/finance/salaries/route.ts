import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Salary } from '@/lib/db/models/Salary'
import { User } from '@/lib/db/models/User'
import { Employee } from '@/lib/db/models/Employee'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find all users who are NOT super_admin
    const nonAdminUsers = await User.find({ role: { $ne: 'super_admin' } }, '_id')
    const nonAdminUserIds = nonAdminUsers.map((u: any) => u._id)

    // Find employees linked to these non-admin users
    const nonAdminEmployees = await Employee.find({ userId: { $in: nonAdminUserIds } }, '_id')
    const nonAdminEmployeeIds = nonAdminEmployees.map((e: any) => e._id)

    const salaries = await Salary.find({ employeeId: { $in: nonAdminEmployeeIds } })
      .populate('employeeId', 'firstName lastName')
      .sort({ createdAt: -1 })

    return NextResponse.json(salaries)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await req.json()
    await connectDB()

    // Create or Update salary record for employee
    const salary = await Salary.findOneAndUpdate(
      { employeeId: data.employeeId },
      data,
      { upsert: true, new: true }
    )

    return NextResponse.json(salary)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
