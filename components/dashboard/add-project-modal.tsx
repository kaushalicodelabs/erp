'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProjects } from '@/lib/hooks/use-projects'
import { useClients } from '@/lib/hooks/use-clients'
import { useEmployees } from '@/lib/hooks/use-employees'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const projectSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  clientId: z.string().min(1, 'Please select a client'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  budget: z.coerce.number().min(0, 'Budget must be positive'),
  projectManager: z.string().min(1, 'Please assign a project manager'),
  status: z.enum(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export function AddProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { createProject, isCreating } = useProjects()
  const { clients } = useClients()
  const { employees } = useEmployees()
  
  const projectManagers = employees?.filter(emp => emp.position === 'Project Manager') || []
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      clientId: '',
      projectManager: '',
      status: 'planning',
      priority: 'medium',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days later
      budget: 0
    }
  })

  const onSubmit = (data: ProjectFormValues) => {
    // Convert string dates to Date objects
    const submissionData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate)
    }
    
    createProject(submissionData as any, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[80vh]">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...register('name')} placeholder="E-commerce Redesign" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  {...register('description')}
                  className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all font-sans"
                  placeholder="Brief project overview..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client</Label>
                  <select 
                    id="clientId" 
                    {...register('clientId')}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="">Select Client</option>
                    {clients?.map(c => (
                      <option key={c._id} value={c._id}>{c.companyName}</option>
                    ))}
                  </select>
                  {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input id="budget" type="number" {...register('budget')} />
                  {errors.budget && <p className="text-xs text-red-500">{errors.budget.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectManager">Project Manager</Label>
                <select 
                  id="projectManager" 
                  {...register('projectManager')}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Select Project Manager</option>
                  {projectManagers.map(pm => (
                    <option key={pm._id} value={pm._id}>{pm.firstName} {pm.lastName}</option>
                  ))}
                </select>
                {errors.projectManager && <p className="text-xs text-red-500">{errors.projectManager.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register('startDate')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" {...register('endDate')} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Launch Project'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
