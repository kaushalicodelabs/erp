import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Project } from '@/lib/db/models/Project'
import { Invoice } from '@/lib/db/models/Invoice'
import { Expense } from '@/lib/db/models/Expense'
import mongoose from 'mongoose'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role === 'employee') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // 1. Fetch all projects with their basic info
    const projects = await Project.find({}).sort({ createdAt: -1 })

    const reports = []

    for (const project of projects) {
      // 2. Fetch all invoices for this project to get billed amount
      const invoices = await Invoice.find({ 
        projectId: project._id,
        status: { $in: ['sent', 'paid'] }
      })
      const billedAmount = invoices.reduce((acc, inv) => acc + inv.total, 0)

      // 3. Fetch all expenses for this project to get project costs
      // Note: If project ID is not in Expense model, we might need to skip or handle separately
      // For now, let's assume we can query expenses by project if we add it, but our current Expense model doesn't have it.
      // Wait, let's check the Expense model.
      
      reports.push({
        _id: project._id,
        name: project.name,
        status: project.status,
        budget: project.budget,
        progress: project.progress,
        billedAmount,
        startDate: project.startDate,
        endDate: project.endDate,
        assignedCount: project.assignedEmployees?.length || 0
      })
    }

    // 4. Global statistics
    const totalBudget = reports.reduce((acc, p) => acc + p.budget, 0)
    const totalBilled = reports.reduce((acc, p) => acc + p.billedAmount, 0)
    const statuses = {
      'planning': reports.filter(p => p.status === 'planning').length,
      'in-progress': reports.filter(p => p.status === 'in-progress').length,
      'completed': reports.filter(p => p.status === 'completed').length,
      'on-hold': reports.filter(p => p.status === 'on-hold').length,
    }

    return NextResponse.json({
      projects: reports,
      summary: {
        totalBudget,
        totalBilled,
        projectCount: reports.length,
        averageProgress: reports.length > 0 ? reports.reduce((acc, p) => acc + p.progress, 0) / reports.length : 0,
        statusBreakdown: statuses
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
