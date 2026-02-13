'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSalaries } from '@/lib/hooks/use-salaries'
import { useEmployees } from '@/lib/hooks/use-employees'
import { UpdateSalaryModal } from '@/components/dashboard/update-salary-modal'
import { GeneratePayrollModal } from '@/components/dashboard/generate-payroll-modal'
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Search,
  ChevronRight,
  History
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Employee } from '@/types'

export default function SalariesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  
  const { employees, isLoading: employeesLoading } = useEmployees()
  const { salaries, isLoading: salariesLoading } = useSalaries()

  const filteredEmployees = employees?.filter(emp => 
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    {
      title: 'Monthly Payroll',
      value: `$${salaries?.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0).toLocaleString() || '0'}`,
      change: '+4.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Active Salaries',
      value: salaries?.filter(s => s.status === 'active').length || 0,
      description: 'Across all departments',
      icon: CreditCard,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Avg. Increment',
      value: '12%',
      change: 'last 12 months',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ]

  const handleUpdateClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payroll Management</h1>
          <p className="text-gray-500 mt-1">Manage employee compensation, bonuses, and deductions.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-11 px-6 rounded-xl font-semibold gap-2 border-gray-200">
            <History className="w-4 h-4" />
            Payroll History
          </Button>
          <Button 
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold gap-2"
          >
            Generate Payroll
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <UpdateSalaryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        employee={selectedEmployee}
        existingSalary={salaries?.find(s => s.employeeId === selectedEmployee?._id || (s.employeeId as any)._id === selectedEmployee?._id)}
      />

      <GeneratePayrollModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                {stat.change && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                    stat.trend === 'up' ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                  )}>
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                {stat.description && <p className="text-xs text-gray-400 mt-1">{stat.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Employee Salaries Table */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-50 bg-gray-50/30 px-8 py-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Employee Compensation</CardTitle>
              <p className="text-sm text-gray-500 font-normal">Base pay and payment configurations</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl border-gray-200 bg-white"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Base Salary</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Frequency</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Name</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(employeesLoading || salariesLoading) ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">Syncing payroll data...</td></tr>
                ) : filteredEmployees?.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">No employees found.</td></tr>
                ) : (
                  filteredEmployees?.map((employee) => {
                    const salary = salaries?.find(s => s.employeeId === employee._id || (s.employeeId as any)._id === employee._id)
                    return (
                      <tr key={employee._id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 uppercase">
                              {employee.firstName[0]}{employee.lastName[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{employee.firstName} {employee.lastName}</span>
                              <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{employee.employeeId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            {salary?.baseSalary ? `$${salary.baseSalary.toLocaleString()}` : 'Not Set'}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className="text-xs font-medium text-gray-600 capitalize">
                            {salary?.paymentFrequency || '—'}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 font-medium">
                            {salary?.bankDetails?.bankName || 'Not Set'}
                          </span>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              salary?.status === 'active' ? "bg-emerald-500" : "bg-gray-300"
                            )} />
                            <span className="text-xs font-bold text-gray-700 capitalize">
                              {salary?.status || 'No Record'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg text-xs font-bold"
                            onClick={() => handleUpdateClick(employee)}
                          >
                            Update Salary
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
