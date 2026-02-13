'use client'

import { useState } from 'react'
import { Loader2, Calendar, DollarSign, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { usePayroll } from '@/lib/hooks/use-payroll'
import { useSalaries } from '@/lib/hooks/use-salaries'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

export function GeneratePayrollModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { generatePayroll, isGenerating } = usePayroll()
  const { salaries } = useSalaries()
  
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const totalMonthlyPayout = salaries?.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0) || 0
  const activeEmployeesCount = salaries?.length || 0

  const handleGenerate = () => {
    generatePayroll({ month, year }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Generate Monthly Payroll
          </DialogTitle>
          <DialogDescription>
            Process bulk salary disbursements for all active employees.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <select 
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-sm"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <select 
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 shadow-sm"
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100 flex flex-col gap-4">
            <h4 className="text-sm font-bold text-violet-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Payroll Summary
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-violet-600 font-medium">Active Employees</span>
                <span className="text-violet-900 font-bold">{activeEmployeesCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-violet-600 font-medium">Estimated Payout</span>
                <span className="text-violet-900 font-bold">${totalMonthlyPayout.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-violet-200 flex justify-between items-center">
                <span className="text-xs text-violet-500 italic">Values based on current base salary profiles.</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">Cancel</Button>
            <Button 
              onClick={handleGenerate}
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-violet-200 gap-2" 
              disabled={isGenerating || activeEmployeesCount === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm Disbursement
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
