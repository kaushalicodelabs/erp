import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useInterviews } from '@/lib/hooks/use-interviews'
import { Loader2, MessageSquare, Star, User, Calendar, Award } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface ViewFeedbackHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  interviewId: string
  candidateName: string
}

export function ViewFeedbackHistoryModal({ isOpen, onClose, interviewId, candidateName }: ViewFeedbackHistoryModalProps) {
  const { useInterviewFeedback } = useInterviews()
  const { data: feedbacks, isLoading } = useInterviewFeedback(interviewId)

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Hire': return 'text-emerald-700 bg-emerald-50 border-emerald-100'
      case 'Hire': return 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50'
      case 'Hold': return 'text-amber-600 bg-amber-50 border-amber-100'
      case 'Reject': return 'text-rose-600 bg-rose-50 border-rose-100'
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-100'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span>Feedback History</span>
                <span className="text-sm font-medium text-zinc-500">{candidateName}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
              <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading Records...</p>
            </div>
          ) : feedbacks && feedbacks.length > 0 ? (
            <div className="space-y-6">
              {feedbacks.map((feedback: any, index: number) => (
                <div key={feedback._id} className="relative pl-8 pb-6 last:pb-0">
                  {/* Timeline Line */}
                  {index !== feedbacks.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-px bg-zinc-200" />
                  )}
                  {/* Round Indicator */}
                  <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white border-2 border-violet-100 flex items-center justify-center text-xs font-black text-violet-600 shadow-sm z-10">
                    {feedback.round || '?'}
                  </div>

                  <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 overflow-hidden">
                          {feedback.interviewerId?.profilePhoto ? (
                            <img src={`/api/files/${feedback.interviewerId.profilePhoto}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">
                            {feedback.interviewerId?.firstName} {feedback.interviewerId?.lastName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-amber-700">{feedback.rating}/5</span>
                        </div>
                        <div className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                          getRecommendationColor(feedback.recommendation)
                        )}>
                          {feedback.recommendation}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          <Award className="w-3 h-3" />
                          Technical
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed italic">"{feedback.technicalSkills || 'No notes'}"</p>
                      </div>
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          <User className="w-3 h-3" />
                          Soft Skills
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed italic">"{feedback.softSkills || 'No notes'}"</p>
                      </div>
                      <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-100/50">
                        <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          <Award className="w-3 h-3" />
                          Culture
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed italic">"{feedback.culturalFit || 'No notes'}"</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-zinc-50">
                      <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Overall Assessment</Label>
                      <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap">{feedback.overallNotes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
              <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-zinc-200" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900">No Feedback History</h3>
              <p className="text-zinc-500 mt-2">Feedback records will appear here once submitted by interviewers.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
