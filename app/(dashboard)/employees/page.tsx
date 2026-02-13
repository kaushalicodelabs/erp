'use client'

import { useState } from 'react'
import { useEmployees } from '@/lib/hooks/use-employees'
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Filter,
  Download,
  Trash2,
  Edit2,
  KeyRound
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import { AddEmployeeModal } from '@/components/dashboard/add-employee-modal'
import { AdminPasswordResetModal } from '@/components/dashboard/admin-password-reset-modal'
import { Pagination } from '@/components/ui/pagination-common'

export default function EmployeesPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 10
  const [searchQuery, setSearchQuery] = useState('')
  const { employees, total, pageCount, isLoading, deleteEmployee, updateEmployee } = useEmployees(currentPage, itemsPerPage, searchQuery)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null)
  const [resetModalEmployee, setResetModalEmployee] = useState<any | null>(null)

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(0) // Reset to first page on search
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your team members and their roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => {
            setSelectedEmployee(null)
            setIsModalOpen(true)
          }}>
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <AddEmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEmployee(null)
        }} 
        employee={selectedEmployee}
      />
      
      <AdminPasswordResetModal 
        isOpen={!!resetModalEmployee} 
        onClose={() => setResetModalEmployee(null)} 
        employee={resetModalEmployee}
      />

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search employees by name, email or department..." 
            className="pl-10 h-11"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11 gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees?.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold overflow-hidden shadow-sm border border-white">
                        {employee.profilePhoto ? (
                          <img 
                            src={`/api/files/${employee.profilePhoto}`} 
                            alt={employee.firstName} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{employee.firstName[0]}{employee.lastName[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</p>
                        <p className="text-xs text-gray-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{employee.position}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      className={cn(
                        "text-[11px] font-bold uppercase px-3 py-1.5 rounded-lg border transition-all cursor-pointer outline-none",
                        employee.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        employee.status === 'on-leave' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-gray-50 text-gray-500 border-gray-200"
                      )}
                      value={employee.status}
                      onChange={(e) => {
                        updateEmployee({ id: employee._id, data: { status: e.target.value as any } })
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on-leave">On Leave</option>
                    </select>
                  </td>
                   <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-amber-600"
                        title="Reset Password"
                        onClick={() => setResetModalEmployee(employee)}
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-indigo-600"
                        onClick={() => {
                          setSelectedEmployee(employee)
                          setIsModalOpen(true)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this employee?')) {
                            deleteEmployee(employee._id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!employees || employees.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-900 font-semibold text-base">No employees found</p>
                      <p className="text-gray-500 text-sm">Try adjusting your search or filters.</p>
                      <Button variant="ghost" className="mt-2 text-violet-600 font-bold" onClick={() => setSearchQuery('')}>Clear search</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      <Pagination 
        pageCount={pageCount || 0}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  </div>
)
}
