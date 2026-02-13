import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Invoice } from '@/lib/db/models/Invoice'
import { Client } from '@/lib/db/models/Client'
import { Project } from '@/lib/db/models/Project'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || (session.user.role !== 'super_admin' && session.user.role !== 'hr' && session.user.role !== 'project_manager')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const query: any = {}
    if (status) query.status = status
    if (clientId) query.clientId = clientId

    const invoices = await Invoice.find(query)
      .populate('clientId', 'companyName')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })

    return NextResponse.json(invoices)
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

    const data = await req.json()
    await connectDB()

    // Generate invoice number if not provided (simple implementation)
    if (!data.invoiceNumber) {
      const count = await Invoice.countDocuments()
      data.invoiceNumber = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`
    }

    const invoice = await Invoice.create(data)
    return NextResponse.json(invoice)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
