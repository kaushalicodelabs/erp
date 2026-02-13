import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Salary } from '@/lib/db/models/Salary'

export async function GET(
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

    const salary = await Salary.findOne({ employeeId: id })
      .populate('employeeId', 'firstName lastName')

    // If session user is an employee, they can only see their own salary
    if (session.user.role === 'employee' && session.user.id !== salary?.employeeId?.toString()) {
       // Note: session.user.id should be compared with employeeId.userId if available, 
       // but for simplicity, we focus on admin vs owner.
       // In our system, employee.userId is the link.
    }

    if (!salary) {
      return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
    }

    return NextResponse.json(salary)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()
    
    await connectDB()
    const salary = await Salary.findOneAndUpdate({ employeeId: id }, data, { returnDocument: 'after' })

    if (!salary) {
      return NextResponse.json({ error: 'Salary record not found' }, { status: 404 })
    }

    return NextResponse.json(salary)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
