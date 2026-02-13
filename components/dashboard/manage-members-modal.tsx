'use client'

import { useState, useEffect } from 'react'
import { Loader2, Users, Search, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProjects } from '@/lib/hooks/use-projects'
import { useEmployees } from '@/lib/hooks/use-employees'
import { Project, Employee } from '@/types'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ManageMembersModal({ 
  isOpen, 
  onClose, 
  project 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  project: Project | null 
}) {
  const { data: session } = useSession()
  const { updateProject, isUpdating } = useProjects()
  const { employees } = useEmployees()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (project) {
      const ids = project.assignedEmployees?.map(emp => 
        typeof emp === 'string' ? emp : emp._id
      ) || []
      setSelectedIds(ids)
    }
  }, [project, isOpen])

  const handleToggleMember = (employeeId: string) => {
    setSelectedIds(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId) 
        : [...prev, employeeId]
    )
  }

  const handleSave = () => {
    if (!project) return
    
    updateProject({ 
      id: project._id, 
      data: { assignedEmployees: selectedIds } 
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  if (!project) return null

  const filteredEmployees = employees?.filter(emp => {
    const matchesSearch = 
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase())
    
    const isActive = emp.status === 'active'
    
    // Role Restriction: 
    // Only Super Admin can add HR and other Project Managers.
    // Project Managers can only add non-PM and non-HR employees.
    const forbiddenPositions = ['Project Manager', 'HR']
    const canSeeRole = session?.user?.role === 'super_admin' || !forbiddenPositions.includes(emp.position)

    return isActive && matchesSearch && canSeeRole
  })

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-violet-600 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Manage Members</DialogTitle>
              <p className="text-violet-100 text-sm opacity-90">{project.name}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search employees..." 
              className="pl-10 h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredEmployees?.map((employee) => {
              const isSelected = selectedIds.includes(employee._id)
              return (
                <button
                  key={employee._id}
                  onClick={() => handleToggleMember(employee._id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group",
                    isSelected 
                      ? "border-violet-600 bg-violet-50" 
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs transition-colors",
                      isSelected ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    )}>
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div className="text-left">
                      <p className={cn(
                        "text-sm font-bold",
                        isSelected ? "text-violet-900" : "text-gray-900"
                      )}>
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{employee.position}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {selectedIds.length} members selected
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-11 rounded-xl font-bold text-gray-500 hover:bg-gray-50 px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isUpdating}
                className="h-11 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 px-8 gap-2"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
