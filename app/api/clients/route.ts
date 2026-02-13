import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Client } from '@/lib/db/models/Client'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '8')
    const skip = page * limit
    const search = searchParams.get('search') || ''

    await connectDB()
    
    let query: any = {}
    if (search) {
      query = {
        $or: [
          { companyName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const total = await Client.countDocuments(query)
    const clients = await Client.find(query)
      .sort({ companyName: 1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      clients,
      total,
      pageCount: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user?.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    const client = await Client.create(body)

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
