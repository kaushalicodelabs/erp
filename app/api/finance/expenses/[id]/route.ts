import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Expense } from '@/lib/db/models/Expense'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await req.json()
    
    await connectDB()
    const expense = await Expense.findByIdAndUpdate(
      id, 
      { 
        ...data, 
        approvedBy: session.user.id,
        approvalDate: new Date()
      }, 
      { returnDocument: 'after' }
    )

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(expense)
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

    const expense = await Expense.findById(id)
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Only allow deletion if pending or if admin
    if (session.user.role !== 'super_admin' && expense.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot delete processed expenses' }, { status: 403 })
    }

    await Expense.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Expense deleted' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
