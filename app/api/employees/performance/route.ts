import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Timesheet } from '@/lib/db/models/Timesheet'
import { Employee } from '@/lib/db/models/Employee'
import { Leave } from '@/lib/db/models/Leave'
import { WFH } from '@/lib/db/models/WFH'
import mongoose from 'mongoose'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { User } from '@/lib/db/models/User'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get('employeeId')
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()

    // Exclude super_admins from global lists
    const nonAdminUsers = await User.find({ role: { $ne: 'super_admin' } }, '_id')
    const nonAdminUserIds = nonAdminUsers.map((u: any) => u._id)
    
    let queryEmployee: any = { userId: { $in: nonAdminUserIds } }

    if (session.user.role === 'employee') {
      queryEmployee.userId = session.user.id
    } else if (employeeId) {
      queryEmployee._id = new mongoose.Types.ObjectId(employeeId)
    }

    const employees = await Employee.find(queryEmployee)
    
    const performanceData = []
    const startDate = new Date(year, month - 1, 1)
    const endDate = endOfMonth(startDate)

    for (const emp of employees) {
      // 1. Attendance Metrics
      const timesheets = await Timesheet.find({
        employeeId: emp._id,
        date: { $gte: startDate, $lte: endDate }
      })

      const totalWorkingDays = timesheets.length
      const daysPresent = timesheets.filter(t => t.status === 'present').length
      const totalHours = timesheets.reduce((acc, t) => acc + (t.hoursWorked || 0), 0)
      const avgHoursPerDay = totalWorkingDays > 0 ? totalHours / totalWorkingDays : 0

      // 2. Leave & WFH Utilization
      const leaves = await Leave.find({
        employeeId: emp._id,
        status: 'approved',
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      })

      const wfhRequests = await WFH.find({
        employeeId: emp._id,
        status: 'approved',
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      })

      // 3. Performance Score (Simplified calculation)
      // Score = (Attendance % * 0.4) + (AvgHours/8 * 0.4) + (Stability/Consistency * 0.2)
      const attendanceRate = totalWorkingDays > 0 ? (daysPresent / 22) * 100 : 0 // Assuming 22 working days
      const productivityScore = Math.min(100, (avgHoursPerDay / 8) * 100)
      const finalScore = Math.min(100, (attendanceRate * 0.5) + (productivityScore * 0.5))

      performanceData.push({
        employee: {
          _id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          department: emp.department,
          position: emp.position
        },
        metrics: {
          daysPresent,
          totalHours,
          avgHoursPerDay,
          attendanceRate: Math.min(100, (daysPresent / 22) * 100),
          leaveCount: leaves.length,
          wfhCount: wfhRequests.length,
          performanceScore: Math.round(finalScore)
        }
      })
    }

    // Sort by performance score for ranking
    performanceData.sort((a, b) => b.metrics.performanceScore - a.metrics.performanceScore)

    return NextResponse.json({
      data: performanceData,
      summary: {
        totalEmployees: employees.length,
        averageScore: performanceData.length > 0 ? performanceData.reduce((acc, curr) => acc + curr.metrics.performanceScore, 0) / performanceData.length : 0,
        topPerformer: performanceData[0]?.employee || null
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
