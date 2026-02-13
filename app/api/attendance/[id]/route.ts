import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Timesheet } from '@/lib/db/models/Timesheet'

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
    await connectDB()

    const timesheet = await Timesheet.findById(id)
    if (!timesheet) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    const checkOut = new Date()
    const checkIn = new Date(timesheet.checkIn)
    
    // Calculate hours worked
    const diffMs = checkOut.getTime() - checkIn.getTime()
    const hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100

    timesheet.checkOut = checkOut
    timesheet.hoursWorked = hoursWorked
    await timesheet.save()

    return NextResponse.json(timesheet)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
