'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, ClipboardCheck, AlertCircle, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useProjectStatusReports } from '@/lib/hooks/use-project-reports'
import { Project } from '@/types'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const reportSchema = z.object({
  status: z.enum(['on-track', 'at-risk', 'delayed', 'completed']),
  summary: z.string().min(10, 'Summary must be at least 10 characters'),
  achievements: z.string().optional(),
  blockers: z.string().optional(),
  nextSteps: z.string().optional(),
  progress: z.number().min(0).max(100),
})

type ReportFormValues = z.infer<typeof reportSchema>

interface SubmitReportModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
}

export function SubmitReportModal({ isOpen, onClose, project }: SubmitReportModalProps) {
  const { submitReport, isSubmitting } = useProjectStatusReports()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema) as any,
    defaultValues: {
      status: 'on-track',
      summary: '',
      progress: project?.progress || 0,
    }
  })

  const currentStatus = watch('status')
  const currentProgress = watch('progress')

  const onSubmit = (data: ReportFormValues) => {
    if (!project) return
    submitReport({
      ...data,
      projectId: project._id
    }, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <ClipboardCheck className="w-5 h-5 text-white" />
              </div>
              Submit Status Report
            </DialogTitle>
            {project && (
              <p className="text-[11px] font-bold text-violet-600 uppercase tracking-widest mt-2 px-1">
                {project.name}
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Health Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'on-track', label: 'On Track', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                      { value: 'at-risk', label: 'At Risk', icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                      { value: 'delayed', label: 'Delayed', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
                      { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                    ].map((s) => (
                      <label 
                        key={s.value}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                          currentStatus === s.value 
                            ? cn(s.bg, s.border, "ring-2 ring-offset-0 ring-violet-500/10")
                            : "bg-white border-zinc-100 hover:border-zinc-200"
                        )}
                      >
                        <input 
                          type="radio" 
                          {...register('status')} 
                          value={s.value} 
                          className="sr-only" 
                        />
                        <s.icon className={cn("w-4 h-4", s.color)} />
                        <span className={cn("text-xs font-bold", currentStatus === s.value ? "text-zinc-900" : "text-zinc-500")}>
                          {s.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Overall Progress</Label>
                    <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{currentProgress}%</span>
                  </div>
                  <input 
                    type="range"
                    {...register('progress', { valueAsNumber: true })}
                    min="0"
                    max="100"
                    className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-violet-600 hover:accent-violet-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Achievements</Label>
                  <textarea 
                    {...register('achievements')}
                    className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm resize-none"
                    placeholder="Key milestones reached..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Brief Summary</Label>
                  <Input 
                    {...register('summary')}
                    placeholder="Concise overview of project state"
                    className="h-12 bg-white border-zinc-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm"
                  />
                  {errors.summary && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.summary.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Blockers / Risks</Label>
                  <textarea 
                    {...register('blockers')}
                    className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm resize-none"
                    placeholder="Anything slowing down the team..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Next Steps</Label>
                  <textarea 
                    {...register('nextSteps')}
                    className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm resize-none"
                    placeholder="Plans for the next reporting period..."
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 mt-8">
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
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Submit Report
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
