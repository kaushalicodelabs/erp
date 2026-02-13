'use client'

import { useState } from 'react'
import { useMeetings } from '@/lib/hooks/use-meetings'
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ChevronRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { CreateMeetingModal } from '@/components/dashboard/create-meeting-modal'
import { AddMOMModal } from '@/components/dashboard/add-mom-modal'
import { Meeting, Employee } from '@/types'
import { Pagination } from '@/components/ui/pagination-common'

export default function MeetingsPage() {
  const { data: session } = useSession()
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 6
  const [searchQuery, setSearchQuery] = useState('')
  const { meetings, total, pageCount, isLoading, deleteMeeting, updateMeeting } = useMeetings(undefined, currentPage, itemsPerPage, searchQuery)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isMOMModalOpen, setIsMOMModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const isSuperAdmin = session?.user?.role === 'super_admin'

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(0)
  }

  const handleAddMOM = (meeting: Meeting) => {
    setSelectedMeeting(meeting)
    setIsMOMModalOpen(true)
  }

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this meeting?')) {
      updateMeeting({ id, data: { status: 'cancelled' } })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1.5 shadow-sm">
            <Clock className="w-3 h-3" />
            Scheduled
          </span>
        )
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meeting Management</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule syncs, track discussions and manage Minutes of Meetings.</p>
        </div>
        <Button 
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2 h-11 px-6 shadow-lg shadow-violet-200 transition-all active:scale-95" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </Button>
      </div>

      <CreateMeetingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <AddMOMModal isOpen={isMOMModalOpen} onClose={() => setIsMOMModalOpen(false)} meeting={selectedMeeting} />

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search meetings by title or agenda..." 
            className="pl-11 h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Meetings List */}
      <div className="grid grid-cols-1 gap-4">
        {meetings?.map((meeting: any) => (
          <div key={meeting._id} className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 group">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Date & Title Section */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  {getStatusBadge(meeting.status)}
                  <span className="text-[10px] font-bold text-violet-600 uppercase tracking-widest bg-violet-50/50 px-2 py-1 rounded">
                    Created by: {typeof meeting.createdBy !== 'string' ? (meeting.createdBy as any)?.name : 'User'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-900 group-hover:text-violet-600 transition-colors">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-violet-500" />
                      {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 border-l border-zinc-200 pl-4">
                      <Clock className="w-4 h-4 text-violet-500" />
                      {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                  {meeting.description || 'No agenda provided for this meeting.'}
                </p>

                {/* Participants */}
                <div className="pt-4 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Participants</h4>
                  <div className="flex flex-wrap gap-2">
                    {(meeting.participants as any[]).map((p: any) => (
                      <div key={p._id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 group/user hover:bg-white hover:border-violet-200 transition-all cursor-default shadow-sm hover:shadow-md">
                        <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold uppercase transition-colors group-hover/user:bg-violet-600 group-hover/user:text-white">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-zinc-700">{p.firstName} {p.lastName}</span>
                          <span className="text-[9px] font-medium text-zinc-400">{p.position}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MOM & Actions Section */}
              <div className="lg:w-[350px] space-y-4 lg:border-l lg:border-gray-50 lg:pl-8">
                {meeting.mom ? (
                  <div className="space-y-3 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl p-5 relative overflow-hidden group/mom">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <FileText className="w-16 h-16 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 mb-1">
                      <FileText className="w-4 h-4" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Minutes of Meeting</h4>
                    </div>
                    <p className="text-xs text-emerald-800/80 leading-relaxed italic line-clamp-[8]">
                      "{meeting.mom}"
                    </p>
                    {isSuperAdmin && (
                      <button 
                        onClick={() => handleAddMOM(meeting)}
                        className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline pt-2 mt-2 border-t border-emerald-100 w-full text-left flex items-center gap-1.5"
                      >
                        Edit MOM <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[160px] rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 p-6 text-center space-y-3 group/empty">
                    {meeting.status === 'completed' ? (
                       <div className="space-y-3">
                         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
                           <AlertCircle className="w-5 h-5 text-amber-500" />
                         </div>
                         <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">MOM Pending</p>
                         {isSuperAdmin && (
                           <Button 
                             onClick={() => handleAddMOM(meeting)}
                             className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase h-9 shadow-lg shadow-emerald-100 transition-all active:scale-95"
                           >
                             Add MOM Now
                           </Button>
                         )}
                       </div>
                    ) : meeting.status === 'scheduled' ? (
                      <div className="space-y-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm group-hover/empty:scale-110 transition-transform duration-500">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-xs font-medium text-zinc-400 max-w-[180px]">MOM can be added once the meeting is completed.</p>
                        <div className="flex flex-col gap-2 pt-2">
                          {isSuperAdmin && (
                            <Button 
                              variant="outline"
                              onClick={() => handleAddMOM(meeting)}
                              className="text-[10px] font-bold uppercase h-8 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                            >
                              Add MOM / Complete
                            </Button>
                          )}
                          {(isSuperAdmin || String(session?.user?.id) === String(typeof (meeting as any).createdBy === 'string' ? (meeting as any).createdBy : (meeting as any).createdBy?._id)) && (
                            <Button 
                              variant="ghost"
                              onClick={() => handleCancel((meeting as any)._id)}
                              className="text-[10px] text-red-400 font-bold uppercase h-8 hover:bg-red-50 hover:text-red-500"
                            >
                              Cancel Meeting
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                         <XCircle className="w-6 h-6 text-zinc-300 mx-auto" />
                         <p className="text-xs font-bold text-zinc-400 uppercase">Meeting Cancelled</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {(!meetings || meetings.length === 0) && (
          <div className="py-20 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-gray-100">
              <Users className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No meetings found</h3>
            <p className="text-gray-400 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
              Schedule your first team sync or project review to keep everyone on the same page.
            </p>
            <Button variant="ghost" className="mt-6 text-violet-600 font-bold hover:bg-violet-50 rounded-xl" onClick={() => setSearchQuery('')}>
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      <Pagination 
        pageCount={pageCount || 0}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
