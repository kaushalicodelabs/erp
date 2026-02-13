import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { User } from '@/lib/db/models/User'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const session = await auth()
    // Only Super Admin and HR can reset passwords
    if (!session || (session.user?.role !== 'super_admin' && session.user?.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, newPassword } = await req.json()
    await connectDB()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash and update password (admin override)
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    return NextResponse.json({ message: 'User password reset successfully' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
