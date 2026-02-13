import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Payroll } from '@/lib/db/models/Payroll'
import { Salary } from '@/lib/db/models/Salary'
import { Employee } from '@/lib/db/models/Employee'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const query: any = {}
    if (month) query.month = parseInt(month)
    if (year) query.year = parseInt(year)

    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'firstName lastName employeeId')
      .sort({ createdAt: -1 })

    return NextResponse.json(payrolls)
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

    const { month, year } = await req.json()
    if (!month || !year) {
      return NextResponse.json({ error: 'Month and Year are required' }, { status: 400 })
    }

    await connectDB()

    // 1. Get all active employees with a salary profile
    const salaries = await Salary.find({ status: 'active' })
    
    if (salaries.length === 0) {
      return NextResponse.json({ message: 'No active salary profiles found' }, { status: 200 })
    }

    const payrollResults = []

    // 2. Process each salary profile
    for (const salaryProfile of salaries) {
      // Check if payroll already exists for this employee/month/year
      const existing = await Payroll.findOne({
        employeeId: salaryProfile.employeeId,
        month,
        year
      })

      if (existing) continue

      // Calculate totals
      const bonusesTotal = salaryProfile.bonuses?.reduce((acc: number, b: any) => acc + b.amount, 0) || 0
      const deductionsTotal = salaryProfile.deductions?.reduce((acc: number, d: any) => acc + d.amount, 0) || 0
      const netPayable = salaryProfile.baseSalary + bonusesTotal - deductionsTotal

      // Create payroll record
      const payroll = await Payroll.create({
        employeeId: salaryProfile.employeeId,
        month,
        year,
        baseSalary: salaryProfile.baseSalary,
        bonuses: bonusesTotal,
        deductions: deductionsTotal,
        netPayable,
        status: 'pending'
      })

      payrollResults.push(payroll)
    }

    return NextResponse.json({
      message: `Successfully generated payroll for ${payrollResults.length} employees`,
      count: payrollResults.length
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
