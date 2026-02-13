import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Timesheet } from '@/lib/db/models/Timesheet'
import { Employee } from '@/lib/db/models/Employee'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const employeeId = searchParams.get('employeeId')

    // If role is employee, they can only see their own attendance
    let targetEmployeeId = employeeId
    if (session.user.role === 'employee' || !employeeId) {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
      }
      targetEmployeeId = employee._id
    }

    const query: any = { employeeId: targetEmployeeId }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month), 1)
      const endDate = new Date(parseInt(year), parseInt(month) + 1, 0)
      query.date = { $gte: startDate, $lte: endDate }
    }

    const attendance = await Timesheet.find(query).sort({ date: -1 })
    return NextResponse.json(attendance)
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

    await connectDB()

    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if already clocked in for today
    const existingEntry = await Timesheet.findOne({
      employeeId: employee._id,
      date: today
    })

    if (existingEntry) {
      return NextResponse.json({ error: 'Already clocked in for today' }, { status: 400 })
    }

    const timesheet = await Timesheet.create({
      employeeId: employee._id,
      date: today,
      checkIn: new Date(),
      status: 'present'
    })

    return NextResponse.json(timesheet)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
