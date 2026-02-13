import { loadEnvConfig } from '@next/env'
const projectDir = process.cwd()
loadEnvConfig(projectDir)

import connectDB from '../lib/db/mongodb'
import { User } from '../lib/db/models/User'
import { Employee } from '../lib/db/models/Employee'
import bcrypt from 'bcryptjs'

async function seedSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await connectDB()

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@erp.com' })
    
    if (existingAdmin) {
      console.log('⚠️  Super admin already exists!')
      console.log('📧 Email: admin@erp.com')
      console.log('🔑 Password: admin123')
      process.exit(0)
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@erp.com',
      password: hashedPassword,
      role: 'super_admin',
    })

    console.log('✅ Super admin user created!')

    // Create employee profile for admin
    await Employee.create({
      userId: adminUser._id,
      employeeId: 'EMP000001',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@erp.com',
      phone: '+1234567890',
      department: 'Admin',
      position: 'Super Admin',
      salary: 0,
      joiningDate: new Date(),
      status: 'active',
    })

    console.log('✅ Employee profile created!')
    console.log('\n🎉 Super Admin Account Created Successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:    admin@erp.com')
    console.log('🔑 Password: admin123')
    console.log('👤 Role:     super_admin')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  IMPORTANT: Please change the password after first login!')
    console.log('\n🚀 You can now login at: http://localhost:3000/login')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
    process.exit(1)
  }
}

seedSuperAdmin()
