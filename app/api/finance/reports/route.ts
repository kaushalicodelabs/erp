import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth.config'
import connectDB from '@/lib/db/mongodb'
import { Invoice } from '@/lib/db/models/Invoice'
import { Expense } from '@/lib/db/models/Expense'
import { Payroll } from '@/lib/db/models/Payroll'
import { startOfYear, endOfYear, format, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user?.role !== 'super_admin' && session.user?.role !== 'hr')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear()

    const startDate = startOfYear(new Date(year, 0, 1))
    const endDate = endOfYear(new Date(year, 0, 1))

    // 1. Get Monthly Revenue (Paid Invoices)
    const revenueByMonth = await Invoice.aggregate([
      {
        $match: {
          status: 'paid',
          dueDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: "$dueDate" },
          total: { $sum: "$total" }
        }
      }
    ])

    // 2. Get Monthly Expenses
    const expensesByMonth = await Expense.aggregate([
      {
        $match: {
          status: 'approved',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" }
        }
      }
    ])

    // 3. Get Monthly Payroll Costs
    const payrollByMonth = await Payroll.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$netPayable" }
        }
      }
    ])

    // 4. Expense Categories Breakdown
    const expenseCategories = await Expense.aggregate([
      {
        $match: {
          status: 'approved',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ])

    // 5. Merge data for charts
    const months = eachMonthOfInterval({ start: startDate, end: endDate })
    
    const monthlyTrends = months.map((month, index) => {
      const monthNum = index + 1
      const revenue = revenueByMonth.find(r => r._id === monthNum)?.total || 0
      const expenses = expensesByMonth.find(e => e._id === monthNum)?.total || 0
      const payroll = payrollByMonth.find(p => p._id === monthNum)?.total || 0
      const totalOut = expenses + payroll

      return {
        month: format(month, 'MMM'),
        revenue,
        expenses,
        payroll,
        totalOut,
        profit: revenue - totalOut
      }
    })

    const totalRevenue = monthlyTrends.reduce((acc, m) => acc + m.revenue, 0)
    const totalExpenses = monthlyTrends.reduce((acc, m) => acc + m.expenses, 0)
    const totalPayroll = monthlyTrends.reduce((acc, m) => acc + m.payroll, 0)
    const netProfit = totalRevenue - (totalExpenses + totalPayroll)

    return NextResponse.json({
      monthlyTrends,
      expenseCategories,
      summary: {
        totalRevenue,
        totalExpenses,
        totalPayroll,
        netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
