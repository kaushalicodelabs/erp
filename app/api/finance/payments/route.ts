import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Payment } from '@/lib/db/models/Payment'
import { Invoice } from '@/lib/db/models/Invoice'
import mongoose from 'mongoose'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr' && session.user.role !== 'project_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const invoiceId = searchParams.get('invoiceId')

    let query: any = {}
    if (invoiceId) {
      query.invoiceId = invoiceId
    }

    const payments = await Payment.find(query)
      .populate('invoiceId')
      .sort({ date: -1 })

    return NextResponse.json(payments)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr' && session.user.role !== 'project_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await req.json()

    // 1. Create Payment
    const payment = await Payment.create(body)

    // 2. Update Invoice Status / Amount Paid
    const invoice = await Invoice.findById(body.invoiceId)
    if (invoice) {
      const allPayments = await Payment.find({ invoiceId: invoice._id, status: 'completed' })
      const totalPaid = allPayments.reduce((acc, p) => acc + p.amount, 0)

      if (totalPaid >= invoice.total) {
        invoice.status = 'paid'
      } else if (totalPaid > 0) {
        invoice.status = 'sent' // Keep as sent/partially paid
      }
      await invoice.save()
    }

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
