'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTasks } from '@/lib/hooks/use-tasks'
import { useProjects } from '@/lib/hooks/use-projects'
import { useEmployees } from '@/lib/hooks/use-employees'
import { useEffect, useState } from 'react'
import { Task } from '@/types'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const taskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  projectId: z.string().min(1, 'Please select a project'),
  assigneeId: z.string().min(1, 'Please select an assignee'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  initialProjectId?: string
  task?: Task | null
}

export function CreateTaskModal({ isOpen, onClose, initialProjectId, task }: CreateTaskModalProps) {
  const { createTask, updateTask, isCreating, isUpdating } = useTasks()
  const { projects } = useProjects()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '')
  
  const selectedProject = projects?.find(p => p._id === selectedProjectId)
  
  const assignees = selectedProject ? [
    ...(typeof selectedProject.projectManager === 'string' ? [] : []), // Explicitly exclude PM
    ...selectedProject.assignedEmployees.filter(emp => typeof emp !== 'string')
  ].filter((emp: any) => emp && emp.position !== 'Project Manager') : []

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      projectId: initialProjectId || '',
      assigneeId: '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  })

  useEffect(() => {
    if (task) {
      setValue('title', task.title)
      setValue('description', task.description)
      const projId = typeof task.projectId === 'string' ? task.projectId : task.projectId._id
      setValue('projectId', projId)
      setSelectedProjectId(projId)
      const empId = typeof task.assigneeId === 'string' ? task.assigneeId : task.assigneeId._id
      setValue('assigneeId', empId)
      setValue('priority', task.priority as any)
      setValue('dueDate', new Date(task.dueDate).toISOString().split('T')[0])
    } else if (initialProjectId) {
      setValue('projectId', initialProjectId)
      setSelectedProjectId(initialProjectId)
    } else {
      reset()
    }
  }, [task, initialProjectId, setValue, reset])

  const onSubmit = (data: TaskFormValues) => {
    if (task) {
      updateTask({ id: task._id, data: data as any }, {
        onSuccess: () => {
          onClose()
        }
      })
    } else {
      createTask(data as any, {
        onSuccess: () => {
          reset()
          onClose()
        }
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Assign New Task'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[80vh]">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" {...register('title')} placeholder="e.g., Design Login Page" />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                   id="description" 
                   {...register('description')}
                   className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                   placeholder="Detailed task instructions..."
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project</Label>
                  {initialProjectId || task ? (
                    <div className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center text-sm text-gray-500 font-medium">
                      {selectedProject?.name || 'Loading project...'}
                    </div>
                  ) : (
                    <select 
                      id="projectId" 
                      {...register('projectId')}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value)
                        setValue('projectId', e.target.value)
                      }}
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    >
                      <option value="">Select Project</option>
                      {projects?.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                  {errors.projectId && <p className="text-xs text-red-500">{errors.projectId.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assigneeId">Assignee</Label>
                  <select 
                    id="assigneeId" 
                    {...register('assigneeId')}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
                    disabled={!selectedProjectId}
                  >
                    <option value="">Select Member</option>
                    {assignees.map((emp: any) => (
                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} ({emp.position})</option>
                    ))}
                  </select>
                  {!selectedProjectId && <p className="text-[10px] text-zinc-500">Pick a project first</p>}
                  {errors.assigneeId && <p className="text-xs text-red-500">{errors.assigneeId.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select 
                    id="priority" 
                    {...register('priority')}
                    className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" {...register('dueDate')} />
                  {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : (task ? 'Save Changes' : 'Create Task')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
