'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLeaves } from '@/lib/hooks/use-leaves'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const leaveSchema = z.object({
  type: z.enum(['sick_full', 'casual_full', 'sick_half', 'casual_half', 'short', 'unpaid', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
})

type LeaveFormValues = z.infer<typeof leaveSchema>

const LEAVE_TYPES = [
  { value: 'sick_full', label: 'Sick Leave (Full)' },
  { value: 'casual_full', label: 'Casual Leave (Full)' },
  { value: 'sick_half', label: 'Sick Leave (Half)' },
  { value: 'casual_half', label: 'Casual Leave (Half)' },
  { value: 'short', label: 'Short Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'other', label: 'Other/Vacation' },
]

export function RequestLeaveModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { submitLeave, isSubmitting } = useLeaves()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema) as any,
    defaultValues: {
      type: 'casual_full',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    }
  })

  const onSubmit = (data: LeaveFormValues) => {
    submitLeave(data as any, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-violet-600" />
            Request Time Off
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Leave Type</Label>
                <select 
                  id="type" 
                  {...register('type')}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  {LEAVE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" {...register('startDate')} className="h-11 rounded-xl" />
                  {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" {...register('endDate')} className="h-11 rounded-xl" />
                  {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  Reason for Leave
                </Label>
                <textarea 
                  id="reason" 
                  {...register('reason')}
                  className="w-full min-h-[100px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-sans"
                  placeholder="Please provide a brief reason..."
                />
                {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-violet-200" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
