import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Employee } from '@/lib/db/models/Employee'
import { User } from '@/lib/db/models/User'
import { mapPositionToRole } from '@/lib/utils/role-utils'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = page * limit
    const search = searchParams.get('search') || ''

    await connectDB()
    
    // Find all users who are NOT super_admin
    const nonAdminUsers = await User.find({ role: { $ne: 'super_admin' } }, '_id')
    const nonAdminUserIds = nonAdminUsers.map(u => u._id)

    let query: any = { userId: { $in: nonAdminUserIds } }
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await Employee.countDocuments(query)
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      employees,
      total,
      pageCount: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user?.role !== 'super_admin' && session.user?.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    await connectDB()

    // Check if employee email already exists
    const existingEmployee = await Employee.findOne({ email: body.email })
    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee with this email already exists' }, { status: 400 })
    }

    // 1. Create User account first
    const hashedPassword = await bcrypt.hash(body.email, 10)
    const newUser = await User.create({
      name: `${body.firstName} ${body.lastName}`,
      email: body.email,
      password: hashedPassword,
      role: mapPositionToRole(body.position)
    })

    // Generate a simple employee ID if not provided (e.g., EMP-001)
    if (!body.employeeId) {
      const count = await Employee.countDocuments()
      body.employeeId = `EMP-${(count + 1).toString().padStart(3, '0')}`
    }

    // 2. Create a new employee linked to the user
    const employee = await Employee.create({
      ...body,
      userId: newUser._id
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
