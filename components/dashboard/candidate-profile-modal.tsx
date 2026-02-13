import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  FileText, 
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface CandidateProfileModalProps {
  isOpen: boolean
  onClose: () => void
  candidate: any
}

export function CandidateProfileModal({ isOpen, onClose, candidate }: CandidateProfileModalProps) {
  if (!candidate) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight uppercase">{candidate.candidateName}</h2>
              <div className="flex items-center gap-2 mt-2 opacity-90 text-sm font-medium">
                <Briefcase className="w-4 h-4" />
                {candidate.role}
                <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                Round {candidate.round || 1}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Contact Information</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <Mail className="w-4 h-4 text-violet-500" />
                    {candidate.candidateEmail}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Interview Details</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    Last/Current: {format(new Date(candidate.startTime), 'MMM dd, yyyy')}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <MapPin className="w-4 h-4 text-violet-500" />
                    {candidate.location || 'Remote'}
                  </div>
                  {candidate.status && (
                    <div className="flex items-center gap-3 text-sm font-medium text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                      <Clock className="w-4 h-4 text-violet-500" />
                      Status: <span className="capitalize">{candidate.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 block">Documents</Label>
                {candidate.resumeUrl ? (
                  <a 
                    href={`/api/files/${candidate.resumeUrl}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-8 rounded-2xl bg-emerald-50 border border-emerald-100 group hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center mb-3 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold text-emerald-700">Download Resume</span>
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1 flex items-center gap-1">
                      PDF Link <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 border border-zinc-100 border-dashed">
                    <FileText className="w-8 h-8 text-zinc-300 mb-2" />
                    <span className="text-sm font-bold text-zinc-400 italic">No Resume Uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl font-bold text-zinc-500 px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
