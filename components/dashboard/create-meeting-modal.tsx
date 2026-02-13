'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Calendar as CalendarIcon, Clock, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMeetings } from '@/lib/hooks/use-meetings'
import { useEmployees } from '@/lib/hooks/use-employees'
import { useState } from 'react'
import { cn } from '@/lib/utils'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const meetingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date and time are required'),
  participants: z.array(z.string()).min(1, 'At least one participant is required'),
})

type MeetingFormValues = z.infer<typeof meetingSchema>

interface CreateMeetingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateMeetingModal({ isOpen, onClose }: CreateMeetingModalProps) {
  const { createMeeting, isCreating } = useMeetings()
  const { employees } = useEmployees()
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().slice(0, 16),
      participants: [],
    }
  })

  const onSubmit = (data: MeetingFormValues) => {
    createMeeting({
      ...data,
      date: new Date(data.date)
    } as any, {
      onSuccess: () => {
        reset()
        setSelectedParticipants([])
        onClose()
      }
    })
  }

  const toggleParticipant = (id: string) => {
    const newSelection = selectedParticipants.includes(id)
      ? selectedParticipants.filter(p => p !== id)
      : [...selectedParticipants, id]
    
    setSelectedParticipants(newSelection)
    setValue('participants', newSelection, { shouldValidate: true })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              Schedule New Meeting
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Meeting Title</Label>
                  <Input 
                    {...register('title')}
                    placeholder="Project Sync, Client Review..."
                    className="h-12 bg-white border-zinc-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm"
                  />
                  {errors.title && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date & Time</Label>
                  <Input 
                    type="datetime-local"
                    {...register('date')}
                    className="h-12 bg-white border-zinc-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm"
                  />
                  {errors.date && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.date.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Agenda / Description</Label>
                  <textarea 
                    {...register('description')}
                    className="w-full min-h-[120px] rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm resize-none"
                    placeholder="Short summary of what will be discussed..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Participants</Label>
                  <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm flex flex-col h-[320px]">
                    <div className="p-3 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Select Team Members</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {employees?.map((emp) => (
                        <button
                          key={emp._id}
                          type="button"
                          onClick={() => toggleParticipant(emp._id)}
                          className={cn(
                            "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all",
                            selectedParticipants.includes(emp._id)
                              ? "bg-violet-50 text-violet-700 ring-1 ring-violet-200 shadow-sm"
                              : "hover:bg-zinc-50 text-gray-600"
                          )}
                        >
                          <div>
                            <p className="text-xs font-bold">{emp.firstName} {emp.lastName}</p>
                            <p className="text-[10px] opacity-70 font-medium">{emp.position}</p>
                          </div>
                          {selectedParticipants.includes(emp._id) && (
                            <div className="w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                              <X className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {errors.participants && (
                      <div className="p-3 border-t border-zinc-100 bg-red-50">
                        <p className="text-[10px] font-bold text-red-500 text-center">{errors.participants.message}</p>
                      </div>
                    )}
                  </div>
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
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Meeting'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
