import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Expense } from '@/lib/db/models/Expense'
import { Employee } from '@/lib/db/models/Employee'

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
    if (status) query.status = status

    // If role is employee, they can only see their own expenses
    if (session.user.role === 'employee') {
      const employee = await Employee.findOne({ userId: session.user.id })
      if (!employee) {
        return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
      }
      query.employeeId = employee._id
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'firstName lastName')
      .sort({ date: -1 })

    return NextResponse.json(expenses)
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

    // Ensure we have the employee ID for the current user
    const employee = await Employee.findOne({ userId: session.user.id })
    if (!employee) {
      return NextResponse.json({ error: 'Employee record not found' }, { status: 404 })
    }

    const expense = await Expense.create({
      ...data,
      employeeId: employee._id,
      status: 'pending' // Always start as pending
    })

    return NextResponse.json(expense)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
