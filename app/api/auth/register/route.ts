import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import { Employee } from '@/lib/db/models/Employee'
import { mapPositionToRole } from '@/lib/utils/role-utils'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role = 'software_developer' } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || mapPositionToRole('Software Developer'),
    })

    // Create employee profile
    const employeeId = `EMP${Date.now().toString().slice(-6)}`
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ') || firstName

    await Employee.create({
      userId: user._id,
      employeeId,
      firstName,
      lastName,
      email,
      phone: '',
      department: 'Engineering',
      position: 'Software Developer',
      salary: 0,
      joiningDate: new Date(),
      status: 'active',
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
