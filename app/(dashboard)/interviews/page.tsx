'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Calendar as CalendarIcon, 
  User, 
  Mail, 
  Briefcase, 
  Clock, 
  MapPin, 
  Video, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  ChevronRight,
  FileText,
  History
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useInterviews } from '@/lib/hooks/use-interviews'
import { Pagination } from '@/components/ui/pagination-common'
import { ScheduleInterviewModal } from '@/components/dashboard/schedule-interview-modal'
import { AddFeedbackModal } from '@/components/dashboard/add-interview-feedback-modal'
import { ViewFeedbackHistoryModal } from '@/components/dashboard/view-feedback-history-modal'
import { CandidateProfileModal } from '@/components/dashboard/candidate-profile-modal'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function InterviewsPage() {
  const { data: session } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 8
  const [statusFilter, setStatusFilter] = useState('all')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [nextRoundData, setNextRoundData] = useState<any>(null)

  const { interviews, total, pageCount, isLoading, updateInterview } = useInterviews(currentPage, itemsPerPage, statusFilter)

  const userRole = session?.user?.role
  const userId = session?.user?.id
  const isAdmin = userRole === 'super_admin' || userRole === 'hr'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-violet-50 text-violet-600 border-violet-100'
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'under_review': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100'
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100'
      case 'rescheduled': return 'bg-amber-50 text-amber-600 border-amber-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const handleAddFeedback = (interview: any) => {
    setSelectedInterview(interview)
    setIsFeedbackModalOpen(true)
  }

  const handlePromote = (interview: any) => {
    setNextRoundData({
      id: interview._id,
      candidateName: interview.candidateName,
      candidateEmail: interview.candidateEmail,
      role: interview.role,
      round: (interview.round || 1) + 1,
      resumeUrl: interview.resumeUrl,
    })
    setIsScheduleModalOpen(true)
  }

  const handleReject = async (id: string) => {
    if (confirm('Are you sure you want to reject this candidate?')) {
      updateInterview({ id, data: { status: 'rejected' } })
    }
  }

  const handleSelect = async (id: string) => {
    if (confirm('Are you sure you want to select this candidate? This will mark the round as complete.')) {
      updateInterview({ id, data: { status: 'completed' } })
    }
  }

  const handleViewHistory = (interview: any) => {
    setSelectedInterview(interview)
    setIsHistoryModalOpen(true)
  }

  const handleViewProfile = (interview: any) => {
    setSelectedInterview(interview)
    setIsProfileModalOpen(true)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Interview Management</h1>
          <p className="text-zinc-500 mt-1">Track candidates and manage hiring workflow.</p>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-bold gap-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Schedule Interview
          </Button>
        )}
      </div>

      {/* Filters & Stats */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start">
        <div className="flex flex-wrap items-center gap-3">
          {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(0); }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                statusFilter === status 
                  ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-100" 
                  : "bg-white text-zinc-500 border-zinc-200 hover:border-violet-300 hover:text-violet-600"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-11 h-11 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-3xl bg-zinc-100 animate-pulse" />
          ))
        ) : interviews?.map((interview: any) => (
          <Card key={interview._id} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 bg-white">
            <CardContent className="p-0">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-all duration-500">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-900 group-hover:text-violet-600 transition-colors uppercase tracking-tight">{interview.candidateName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">{interview.role}</p>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span className="px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-tighter border border-violet-100/50">
                          Round {interview.round || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100">
                        <MoreVertical className="w-4 h-4 text-zinc-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-none shadow-xl">
                      <DropdownMenuItem className="text-xs font-bold rounded-lg cursor-pointer" onClick={() => handleViewProfile(interview)}>View Profile</DropdownMenuItem>
                      {isAdmin && (
                        <>
                          {interview.status !== 'completed' && interview.status !== 'rejected' && (
                            <DropdownMenuItem className="text-xs font-bold rounded-lg cursor-pointer" onClick={() => updateInterview({ id: interview._id, data: { status: 'cancelled' } })}>Cancel</DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-xs font-bold rounded-lg cursor-pointer text-red-600">Delete</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 bg-zinc-50 rounded-xl p-2.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {format(new Date(interview.startTime), 'MMM dd, yyyy')} | {format(new Date(interview.startTime), 'hh:mm a')}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 bg-zinc-50 rounded-xl p-2.5">
                    <Video className="w-3.5 h-3.5" />
                    {interview.meetingLink ? (
                      <a href={interview.meetingLink} target="_blank" className="text-violet-600 hover:underline">Join Meeting</a>
                    ) : interview.location || 'Remote'}
                  </div>
                  {interview.resumeUrl && (
                    <div className="flex items-center gap-3 text-xs font-medium text-zinc-500 bg-emerald-50 text-emerald-600 rounded-xl p-2.5">
                      <FileText className="w-3.5 h-3.5" />
                      <a href={`/api/files/${interview.resumeUrl}`} target="_blank" className="hover:underline font-bold">Download Resume</a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-50">
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shrink-0",
                    getStatusColor(interview.status)
                  )}>
                    {interview.status === 'scheduled' 
                      ? `Scheduled to Round ${interview.round || 1}` 
                      : interview.status === 'completed'
                      ? 'Selected'
                      : interview.status === 'rejected'
                      ? 'Rejected'
                      : interview.status === 'under_review'
                      ? 'Review Feedback'
                      : interview.status
                    }
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end min-h-[32px]">
                    {/* Interviewer Action */}
                    {interview.status === 'scheduled' && (interview.interviewer?.userId === userId || isAdmin) && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleAddFeedback(interview)}
                        className="h-8 px-3 rounded-lg text-violet-600 bg-violet-50 hover:bg-violet-100 font-bold text-[9px] uppercase tracking-wider"
                      >
                        Submit Feedback
                      </Button>
                    )}

                    {/* HR/Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewHistory(interview)}
                          className="h-8 w-8 p-0 rounded-lg text-zinc-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                          title="View Feedback History"
                        >
                          <History className="w-4 h-4" />
                        </Button>

                        {/* If UNDER REVIEW: Show Promote, Select and Reject */}
                        {interview.status === 'under_review' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handlePromote(interview)}
                              className="h-8 px-3 rounded-lg text-white bg-violet-600 hover:bg-violet-700 font-bold text-[9px] uppercase tracking-wider whitespace-nowrap"
                            >
                              Next Round
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleSelect(interview._id)}
                              className="h-8 px-3 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 font-bold text-[9px] uppercase tracking-wider whitespace-nowrap"
                            >
                              Select
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleReject(interview._id)}
                              className="h-8 px-3 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold text-[9px] uppercase tracking-wider whitespace-nowrap"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Interviewer Info Overlay */}
              <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 group-hover:bg-violet-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-violet-600 border border-violet-100">
                      {interview.interviewer?.firstName?.[0]}{interview.interviewer?.lastName?.[0]}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                      By {interview.interviewer?.firstName} {interview.interviewer?.lastName}
                    </span>
                  </div>
                  {interview.status === 'rejected' && (
                    <div className="flex items-center gap-1 text-rose-600 text-[9px] font-black uppercase tracking-widest">
                      <AlertCircle className="w-3 h-3" />
                      Candidate Rejected
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && interviews?.length === 0 && (
        <div className="p-20 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
          <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CalendarIcon className="w-10 h-10 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No Interviews Found</h3>
          <p className="text-zinc-500 mt-2">Looks like there are no interviews scheduled for this period.</p>
        </div>
      )}

      {/* Pagination */}
      <Pagination 
        pageCount={pageCount || 0}
        currentPage={currentPage}
        onPageChange={(p) => setCurrentPage(p)}
      />

      <ScheduleInterviewModal 
        isOpen={isScheduleModalOpen}
        onClose={() => { setIsScheduleModalOpen(false); setNextRoundData(null); }}
        initialData={nextRoundData}
        interviewId={nextRoundData?.id}
      />

      {selectedInterview && (
        <ViewFeedbackHistoryModal 
          isOpen={isHistoryModalOpen}
          onClose={() => { setIsHistoryModalOpen(false); setSelectedInterview(null); }}
          interviewId={selectedInterview._id}
          candidateName={selectedInterview.candidateName}
        />
      )}

      {selectedInterview && (
        <AddFeedbackModal 
          isOpen={isFeedbackModalOpen}
          onClose={() => { setIsFeedbackModalOpen(false); setSelectedInterview(null); }}
          interviewId={selectedInterview._id}
          candidateName={selectedInterview.candidateName}
          interview={selectedInterview}
        />
      )}

      {selectedInterview && (
        <CandidateProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => { setIsProfileModalOpen(false); setSelectedInterview(null); }}
          candidate={selectedInterview}
        />
      )}
    </div>
  )
}
