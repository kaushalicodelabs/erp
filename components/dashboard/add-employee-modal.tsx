'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEmployees } from '@/lib/hooks/use-employees'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const employeeSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  position: z.string().min(2, 'Position is required'),
  department: z.string().min(2, 'Department is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  status: z.enum(['active', 'inactive', 'on-leave']).default('active'),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export function AddEmployeeModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { createEmployee, isCreating } = useEmployees()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      status: 'active',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0
    }
  })

  const onSubmit = (data: EmployeeFormValues) => {
    // Map string date to Date object for the hook
    const submissionData = {
      ...data,
      joiningDate: new Date(data.joiningDate)
    }
    
    createEmployee(submissionData as any, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[80vh]">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} placeholder="Jane" />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} placeholder="Doe" />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register('email')} placeholder="jane.doe@company.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" {...register('phone')} placeholder="+1 (555) 000-0000" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <select 
                  id="position" 
                  {...register('position')} 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="">Select Position</option>
                  {[
                    'Super Admin',
                    'HR',
                    'Project Manager',
                    'Graphic Designer',
                    'Associate Software Developer',
                    'Software Developer',
                    'Senior Software Developer'
                  ].map(pos => <option key={pos} value={pos}>{pos}</option>)}
                </select>
                {errors.position && <p className="text-xs text-red-500">{errors.position.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select 
                  id="department" 
                  {...register('department')} 
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {[
                    'Admin',
                    'HR',
                    'MERN',
                    'React Native',
                    'Project Management','UI/UX'
                  ].map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500">{errors.department.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary ($)</Label>
                <Input id="salary" type="number" {...register('salary')} placeholder="85000" />
                {errors.salary && <p className="text-xs text-red-500">{errors.salary.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date</Label>
                <Input id="joiningDate" type="date" {...register('joiningDate')} />
                {errors.joiningDate && <p className="text-xs text-red-500">{errors.joiningDate.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white min-w-[120px]" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Employee'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
