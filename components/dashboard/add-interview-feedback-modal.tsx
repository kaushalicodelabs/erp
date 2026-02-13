'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Star, CheckCircle2, XCircle, Info, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useInterviews } from '@/lib/hooks/use-interviews'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from 'react'

const feedbackSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  technicalSkills: z.string().optional(),
  softSkills: z.string().optional(),
  culturalFit: z.string().optional(),
  recommendation: z.enum(['Hire', 'Strong Hire', 'Reject', 'Hold']),
  overallNotes: z.string().optional(),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

interface AddFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  interviewId: string
  candidateName: string
  interview?: any
}

export function AddFeedbackModal({ isOpen, onClose, interviewId, candidateName, interview }: AddFeedbackModalProps) {
  const { submitFeedback, isSubmittingFeedback } = useInterviews()
  const [rating, setRating] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema) as any,
    defaultValues: {
      rating: 0,
      recommendation: 'Hold',
      technicalSkills: '',
      softSkills: '',
      culturalFit: '',
      overallNotes: '',
    }
  })

  const onSubmit = (data: FeedbackFormValues) => {
    submitFeedback({
      id: interviewId,
      data
    }, {
      onSuccess: () => {
        reset()
        setRating(0)
        onClose()
      }
    })
  }

  const handleRating = (value: number) => {
    setRating(value)
    setValue('rating', value, { shouldValidate: true })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold text-zinc-900 tracking-tight flex flex-col gap-0.5">
              <span>Submit Interview Feedback</span>
              <span className="text-xs font-medium text-zinc-400">for {candidateName}</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[9px] font-black uppercase tracking-wider border border-violet-200">
                  Round {interview?.round || 1}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">{interview?.type}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
            <div className="space-y-4">
              {/* Rating */}
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Overall Rating</Label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      className={cn(
                        "p-1 rounded-lg transition-all transform hover:scale-110 active:scale-95",
                        rating >= star ? "text-amber-400 bg-amber-50" : "text-zinc-200 hover:bg-zinc-50"
                      )}
                    >
                      <Star className={cn("w-6 h-6", rating >= star && "fill-current")} />
                    </button>
                  ))}
                </div>
                {errors.rating && <p className="text-[10px] font-medium text-red-500">{errors.rating.message}</p>}
              </div>

              {/* Recommendation */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Final Recommendation</Label>
                <Select {...register('recommendation')} className="h-10 text-xs">
                  <SelectItem value="Strong Hire">Strong Hire</SelectItem>
                  <SelectItem value="Hire">Hire</SelectItem>
                  <SelectItem value="Hold">Hold</SelectItem>
                  <SelectItem value="Reject">Reject</SelectItem>
                </Select>
                {errors.recommendation && <p className="text-[10px] font-medium text-red-500">{errors.recommendation.message}</p>}
              </div>

              {/* Skills Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Technical Skills</Label>
                  <textarea 
                    {...register('technicalSkills')}
                    className="w-full min-h-[60px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm resize-none"
                    placeholder="Coding ability, problem solving..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Soft Skills & Communication</Label>
                  <textarea 
                    {...register('softSkills')}
                    className="w-full min-h-[60px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[11px] text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm resize-none"
                    placeholder="Clarity, confidence, teamwork..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Overall Notes</Label>
                <textarea 
                  {...register('overallNotes')}
                  className="w-full min-h-[80px] rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm resize-none"
                  placeholder="Summary of your assessment and decision..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="rounded-xl px-4 h-10 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all font-bold text-[10px] uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 h-10 shadow-[0_10px_20px_-5px_rgba(124,58,237,0.3)] font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95" 
                disabled={isSubmittingFeedback}
              >
                {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
