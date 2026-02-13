'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle2, Layout, Clock, AlertTriangle, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useProjects } from '@/lib/hooks/use-projects'
import { Project } from '@/types'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const updateSchema = z.object({
  status: z.enum(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled']),
  progress: z.coerce.number().min(0).max(100),
})

type UpdateFormValues = z.infer<typeof updateSchema>

export function UpdateProjectStatusModal({ 
  isOpen, 
  onClose, 
  project 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  project: Project | null 
}) {
  const { updateProject, isUpdating } = useProjects()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema) as any,
  })

  useEffect(() => {
    if (project) {
      reset({
        status: project.status,
        progress: project.progress
      })
    }
  }, [project, reset])

  const onSubmit = (data: UpdateFormValues) => {
    if (!project) return
    
    updateProject({ id: project._id, data }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  if (!project) return null

  const currentStatus = watch('status')
  const currentProgress = watch('progress')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-violet-600 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Update Status</DialogTitle>
              <p className="text-violet-100 text-sm opacity-90">{project.name}</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Project Status</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'planning', label: 'Planning', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { value: 'in-progress', label: 'In Progress', icon: PlayCircle, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { value: 'on-hold', label: 'On Hold', icon: AlertTriangle, label_text: 'On Hold', color: 'text-amber-600', bg: 'bg-amber-50' },
                  { value: 'completed', label: 'Completed', icon: CheckCircle2, label_text: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setValue('status', s.value as any)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 text-left ${
                      currentStatus === s.value 
                        ? 'border-violet-600 bg-violet-50 ring-4 ring-violet-50' 
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <s.icon className={`w-5 h-5 ${currentStatus === s.value ? 'text-violet-600' : 'text-gray-400'}`} />
                    <span className={`text-sm font-bold ${currentStatus === s.value ? 'text-violet-900' : 'text-gray-600'}`}>
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Project Progress</Label>
                <span className="text-sm font-bold text-violet-600 bg-violet-100 px-3 py-1 rounded-full">{currentProgress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                {...register('progress')}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 h-12 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 gap-2"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
