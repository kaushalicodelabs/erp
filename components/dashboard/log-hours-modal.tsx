'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTasks } from '@/lib/hooks/use-tasks'
import { Task } from '@/types'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const logSchema = z.object({
  hours: z.coerce.number().min(0.1, 'Minimum 0.1 hours required').max(24, 'Max 24 hours per entry'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(5, 'Description of work is required'),
})

type LogFormValues = z.infer<typeof logSchema>

interface LogHoursModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
}

export function LogHoursModal({ isOpen, onClose, task }: LogHoursModalProps) {
  const { logTime, isLoggingTime } = useTasks()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema) as any,
    defaultValues: {
      hours: 1,
      date: new Date().toISOString().split('T')[0],
      description: '',
    }
  })

  const onSubmit = (data: LogFormValues) => {
    if (!task) return
    const submissionData = {
      ...data,
      date: new Date(data.date)
    }
    logTime({ taskId: task._id, data: submissionData as any }, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight">Log Working Hours</DialogTitle>
                {task && (
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-[0.2em] mt-1.5 opacity-80">
                    {task.title}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <Label htmlFor="hours" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                    Hours Worked
                  </Label>
                  <Input 
                    id="hours" 
                    type="number" 
                    step="0.5" 
                    {...register('hours')} 
                    className="h-12 bg-white border-zinc-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all placeholder:text-zinc-400 shadow-sm"
                  />
                  {errors.hours && <p className="text-[10px] font-medium text-red-500 mt-1 ml-1">{errors.hours.message}</p>}
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="date" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                    Date
                  </Label>
                  <Input 
                    id="date" 
                    type="date" 
                    {...register('date')} 
                    className="h-12 bg-white border-zinc-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm"
                  />
                  {errors.date && <p className="text-[10px] font-medium text-red-500 mt-1 ml-1">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                  Work Description
                </Label>
                <textarea 
                  id="description" 
                  {...register('description')}
                  className="w-full min-h-[120px] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all font-sans placeholder:text-zinc-400 shadow-sm resize-none"
                  placeholder="What did you work on today?"
                />
                {errors.description && <p className="text-[10px] font-medium text-red-500 mt-1 ml-1">{errors.description.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="rounded-xl px-6 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all font-bold text-xs uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-12 shadow-[0_10px_20px_-5px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(124,58,237,0.4)] transition-all font-bold text-xs uppercase tracking-wider active:scale-95 disabled:scale-100" 
                disabled={isLoggingTime}
              >
                {isLoggingTime ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Log Hours'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
