'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useMeetings } from '@/lib/hooks/use-meetings'
import { Meeting } from '@/types'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const momSchema = z.object({
  mom: z.string().min(10, 'MOM must be at least 10 characters'),
})

type MOMFormValues = z.infer<typeof momSchema>

interface AddMOMModalProps {
  isOpen: boolean
  onClose: () => void
  meeting: Meeting | null
}

export function AddMOMModal({ isOpen, onClose, meeting }: AddMOMModalProps) {
  const { updateMeeting, isUpdating } = useMeetings()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MOMFormValues>({
    resolver: zodResolver(momSchema) as any,
    defaultValues: {
      mom: meeting?.mom || '',
    }
  })

  // Reset form when meeting changes
  if (isOpen && meeting && meeting.mom && !isUpdating) {
    // This is a simple way to sync, though useEffect is better
  }

  const onSubmit = (data: MOMFormValues) => {
    if (!meeting) return
    updateMeeting({ id: meeting._id, data }, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Add Minutes of Meeting
            </DialogTitle>
            {meeting && (
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-2 px-1">
                {meeting.title}
              </p>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Documentation / Summary</Label>
              <textarea 
                {...register('mom')}
                className="w-full min-h-[250px] rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all shadow-sm resize-none font-sans leading-relaxed"
                placeholder="Detail the key decisions, action items, and discussion points..."
              />
              {errors.mom && <p className="text-[10px] font-medium text-red-500 mt-1 ml-1">{errors.mom.message}</p>}
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 h-12 shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(16,185,129,0.4)] transition-all font-bold text-xs uppercase tracking-wider active:scale-95 disabled:scale-100" 
                disabled={isUpdating}
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Save & Complete Meeting
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
