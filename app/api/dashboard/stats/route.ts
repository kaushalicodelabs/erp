import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Employee } from '@/lib/db/models/Employee'
import { Project } from '@/lib/db/models/Project'
import { Invoice } from '@/lib/db/models/Invoice'
import { Expense } from '@/lib/db/models/Expense'
import { Client } from '@/lib/db/models/Client'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const role = session.user.role
    const userId = session.user.id

    // Date ranges
    const now = new Date()
    const currentMonthStart = startOfMonth(now)
    const currentMonthEnd = endOfMonth(now)
    const lastMonthStart = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    if (role === 'super_admin' || role === 'hr') {
      // Admin View Stats
      const totalEmployees = await Employee.countDocuments()
      const activeProjects = await Project.countDocuments({ status: { $ne: 'completed' } })
      
      const allInvoices = await Invoice.find({})
      const totalRevenue = allInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
      const collectedRevenue = allInvoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + (inv.total || 0), 0)
      const receivables = totalRevenue - collectedRevenue

      const allExpenses = await Expense.find({})
      const totalExpenses = allExpenses.reduce((acc, exp) => acc + (exp.amount || 0), 0)

      const lastMonthInvoices = await Invoice.find({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } })
      const lastMonthRevenue = lastMonthInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0)
      const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

      // Recent Projects
      const recentProjects = await Project.find({})
        .populate('clientId', 'companyName')
        .sort({ createdAt: -1 })
        .limit(5)

      return NextResponse.json({
        role: 'admin',
        stats: {
          totalRevenue,
          collectedRevenue,
          receivables,
          revenueChange,
          totalEmployees,
          activeProjects,
          totalExpenses,
          pendingInvoices: allInvoices.filter(inv => inv.status !== 'paid').length,
          overdueInvoices: allInvoices.filter(inv => inv.status === 'overdue').length,
        },
        recentProjects
      })

    } else {
      // Employee Specific Stats
      const employee = await Employee.findOne({ userId })
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
      }

      const myProjects = await Project.find({
        $or: [
          { projectManager: employee._id },
          // Add team member logic if exists
        ]
      }).populate('clientId', 'companyName').limit(5)

      const myExpenses = await Expense.find({ employeeId: employee._id })
      const pendingExpenses = myExpenses.filter(e => e.status === 'pending').reduce((acc, e) => acc + (e.amount || 0), 0)

      return NextResponse.json({
        role: 'employee',
        stats: {
          myActiveProjects: myProjects.length,
          pendingExpenses,
          // Add more employee stats here (leaves, etc.)
        },
        recentProjects: myProjects
      })
    }

  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
