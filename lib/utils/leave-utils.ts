import { LeaveBalance } from '../db/models/LeaveBalance'
import { startOfMonth, subMonths, getMonth, getYear } from 'date-fns'

export async function getOrCreateBalance(employeeId: string, inputDate: any = new Date()) {
  const date = new Date(inputDate)
  if (isNaN(date.getTime())) {
    console.error('Invalid date passed to getOrCreateBalance:', inputDate)
    return null
  }
  const month = getMonth(date)
  const year = getYear(date)

  let balance = await LeaveBalance.findOne({ employeeId, month, year })

  if (!balance) {
    // Check for previous month's balance to carry forward
    const prevDate = subMonths(date, 1)
    const prevMonth = getMonth(prevDate)
    const prevYear = getYear(prevDate)
    
    const prevBalance = await LeaveBalance.findOne({ 
      employeeId, 
      month: prevMonth, 
      year: prevYear 
    })

    const carryFull = prevBalance 
      ? Math.max(0, (prevBalance.fullDay.quota + prevBalance.fullDay.carriedForward) - prevBalance.fullDay.used)
      : 0
    
    const carryHalf = prevBalance
      ? Math.max(0, (prevBalance.halfDay.quota + prevBalance.halfDay.carriedForward) - prevBalance.halfDay.used)
      : 0

    balance = await LeaveBalance.create({
      employeeId,
      month,
      year,
      fullDay: {
        quota: 1,
        used: 0,
        carriedForward: carryFull
      },
      halfDay: {
        quota: 2,
        used: 0,
        carriedForward: carryHalf
      },
      short: {
        quota: 1,
        used: 0
      }
    })
  }

  return balance
}

export async function checkQuota(employeeId: string, type: string, date: Date) {
  const balance = await getOrCreateBalance(employeeId, date)
  
  if (type.includes('full')) {
    // Rule: Either 1 full OR half leaves. If any half-day is used, cannot take a full day.
    if (balance.halfDay.used > 0) {
      return false
    }
    return (balance.fullDay.used < (balance.fullDay.quota + balance.fullDay.carriedForward))
  } else if (type.includes('half')) {
    // Rule: If full taken then cannot take half sick or casual paid.
    if (balance.fullDay.used > 0) {
      return false
    }
    return (balance.halfDay.used < (balance.halfDay.quota + balance.halfDay.carriedForward))
  } else if (type === 'short') {
    return (balance.short.used < balance.short.quota)
  }
  
  return true // unpaid or other
}

export async function updateLeaveUsage(employeeId: string, type: string, inputDate: any, increment: boolean = true) {
  const date = new Date(inputDate)
  if (isNaN(date.getTime())) {
    console.error('Invalid date passed to updateLeaveUsage:', inputDate)
    return
  }
  const month = getMonth(date)
  const year = getYear(date)
  const amount = increment ? 1 : -1

  const update: any = {}
  if (type.includes('full')) {
    update['fullDay.used'] = amount
  } else if (type.includes('half')) {
    update['halfDay.used'] = amount
  } else if (type === 'short') {
    update['short.used'] = amount
  }

  if (Object.keys(update).length > 0) {
    await LeaveBalance.findOneAndUpdate(
      { employeeId, month, year },
      { $inc: update },
      { upsert: true }
    )
  }
}
