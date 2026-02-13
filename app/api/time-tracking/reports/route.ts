import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Timesheet } from '@/lib/db/models/Timesheet'
import { Employee } from '@/lib/db/models/Employee'
import mongoose from 'mongoose'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, parseISO } from 'date-fns'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const employeeId = searchParams.get('employeeId')
    const department = searchParams.get('department')

    let query: any = {}

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: startOfDay(parseISO(startDate)),
        $lte: endOfDay(parseISO(endDate))
      }
    } else {
      // Default to current month
      const today = new Date()
      query.date = {
        $gte: startOfMonth(today),
        $lte: endOfMonth(today)
      }
    }

    // Role-based filtering
    if (session.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 })
      }
      query.employeeId = employee._id
    } else if (employeeId) {
      query.employeeId = new mongoose.Types.ObjectId(employeeId)
    }

    // Department filtering (requires join)
    if (department && department !== 'all') {
      const employeesInDept = await Employee.find({ department }).select('_id')
      const deptIds = employeesInDept.map(e => e._id)
      query.employeeId = { $in: deptIds }
    }

    // Aggregation for productivity stats
    const stats = await Timesheet.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalHours: { $sum: "$hoursWorked" },
          count: { $sum: 1 },
          present: { 
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } 
          }
        }
      },
      { $sort: { "_id": 1 } }
    ])

    // Detailed breakdown by employee
    const breakdown = await Timesheet.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$employeeId",
          totalHours: { $sum: "$hoursWorked" },
          daysPresent: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          averageHours: { $avg: "$hoursWorked" }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' }
    ])

    return NextResponse.json({
      stats,
      breakdown,
      summary: {
        totalHours: stats.reduce((acc, curr) => acc + curr.totalHours, 0),
        activeDays: stats.length,
        averageDailyHours: stats.length > 0 ? stats.reduce((acc, curr) => acc + curr.totalHours, 0) / stats.length : 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
