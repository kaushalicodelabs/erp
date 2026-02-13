import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Calendar as CalendarIcon, Mail, User, MapPin, Link as LinkIcon, Info, Briefcase, Upload, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInterviews } from '@/lib/hooks/use-interviews'
import { useEmployees } from '@/lib/hooks/use-employees'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import api from '@/lib/api/axios'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectItem,
} from "@/components/ui/select"

const interviewSchema = z.object({
  candidateName: z.string().min(2, 'Candidate name is required'),
  candidateEmail: z.string().email('Invalid email address'),
  role: z.string().min(2, 'Role is required'),
  interviewer: z.string().min(1, 'Interviewer is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  type: z.enum(['Technical', 'HR', 'Managerial', 'Final']),
  round: z.coerce.number().min(1, 'Round is required'),
  location: z.string().optional(),
  meetingLink: z.string().optional(),
  notes: z.string().optional(),
  resumeUrl: z.string().optional(),
})

type InterviewFormValues = z.infer<typeof interviewSchema>

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: Partial<InterviewFormValues>
  interviewId?: string
}

export function ScheduleInterviewModal({ isOpen, onClose, initialData, interviewId }: ScheduleInterviewModalProps) {
  const { scheduleInterview, isScheduling, updateInterview, isUpdating } = useInterviews()
  const { employees } = useEmployees()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewSchema) as any,
    defaultValues: {
      candidateName: initialData?.candidateName || '',
      candidateEmail: initialData?.candidateEmail || '',
      role: initialData?.role || '',
      interviewer: initialData?.interviewer || '',
      startTime: '',
      endTime: '',
      type: initialData?.type || 'Technical',
      round: initialData?.round || 1,
      location: initialData?.location || '',
      meetingLink: initialData?.meetingLink || '',
      notes: initialData?.notes || '',
      resumeUrl: initialData?.resumeUrl || '',
    }
  })

  // Update form when initialData changes
  useEffect(() => {
    if (isOpen) {
      reset({
        candidateName: initialData?.candidateName || '',
        candidateEmail: initialData?.candidateEmail || '',
        role: initialData?.role || '',
        interviewer: '',
        startTime: '',
        endTime: '',
        type: initialData?.type || 'Technical',
        round: initialData?.round || 1,
        location: initialData?.location || '',
        meetingLink: initialData?.meetingLink || '',
        notes: '',
        resumeUrl: initialData?.resumeUrl || '',
      })
      setResumeFile(null)
    }
  }, [isOpen, initialData, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const uploadResume = async (file: File) => {
    const formData = new FormData()
    formData.append('files', file)
    const { data } = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.files[0].id
  }

  const onSubmit = async (data: InterviewFormValues) => {
    try {
      let resumeUrl = data.resumeUrl
      if (resumeFile) {
        setIsUploading(true)
        resumeUrl = await uploadResume(resumeFile)
      }

      const submissionData = {
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        resumeUrl,
        status: 'scheduled' as const
      }

      if (interviewId) {
        updateInterview({ id: interviewId, data: submissionData as any }, {
          onSuccess: () => {
            reset()
            setResumeFile(null)
            onClose()
          }
        })
      } else {
        scheduleInterview(submissionData as any, {
          onSuccess: () => {
            reset()
            setResumeFile(null)
            onClose()
          }
        })
      }
    } catch (error) {
      console.error('Submit failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl rounded-3xl bg-white">
        <div className="bg-gradient-to-br from-white to-zinc-50/50 p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              Schedule Interview
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Candidate Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      {...register('candidateName')}
                      placeholder="John Doe"
                      className="pl-11 h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                  </div>
                  {errors.candidateName && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.candidateName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Candidate Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      type="email"
                      {...register('candidateEmail')}
                      placeholder="john@example.com"
                      className="pl-11 h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                  </div>
                  {errors.candidateEmail && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.candidateEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Job Role / Position</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      {...register('role')}
                      placeholder="Software Developer"
                      className="pl-11 h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                  </div>
                  {errors.role && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Interview Type</Label>
                  <Select {...register('type')}>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Managerial">Managerial</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </Select>
                  {errors.type && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Interview Round</Label>
                  <Select {...register('round')}>
                    <option value="1">Round 1</option>
                    <option value="2">Round 2</option>
                    <option value="3">Round 3</option>
                    <option value="4">Round 4</option>
                    <option value="5">Round 5</option>
                  </Select>
                  {errors.round && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.round.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Interviewer</Label>
                  <Select {...register('interviewer')}>
                    <option value="">Select team member</option>
                    {employees?.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.position})
                      </option>
                    ))}
                  </Select>
                  {errors.interviewer && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.interviewer.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Start Time</Label>
                    <Input 
                      type="datetime-local"
                      {...register('startTime')}
                      className="h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                    {errors.startTime && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.startTime.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">End Time</Label>
                    <Input 
                      type="datetime-local"
                      {...register('endTime')}
                      className="h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                    {errors.endTime && <p className="text-[10px] font-medium text-red-500 mt-1">{errors.endTime.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      {...register('location')}
                      placeholder="Meeting Room 1, Remote..."
                      className="pl-11 h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Meeting Link (Optional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      {...register('meetingLink')}
                      placeholder="Google Meet, Zoom link..."
                      className="pl-11 h-12 bg-white border-zinc-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-violet-500/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Candidate Resume</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-6 transition-all cursor-pointer flex flex-col items-center justify-center gap-2",
                  resumeFile ? "bg-violet-50 border-violet-200" : "bg-white border-zinc-100 hover:border-violet-200 hover:bg-zinc-50/50"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx"
                />
                {!resumeFile && watch('resumeUrl') ? (
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-bold text-zinc-900 truncate">Attached Resume</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Available from previous round</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <a 
                        href={`/api/files/${watch('resumeUrl')}`} 
                        target="_blank" 
                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </a>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => { e.stopPropagation(); setValue('resumeUrl', ''); }}
                        className="h-8 w-8 rounded-lg hover:bg-rose-100 text-zinc-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : resumeFile ? (
                  <div className="flex items-center gap-3 w-full text-left">
                    <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center text-white shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-900 truncate">{resumeFile.name}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{(resumeFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { e.stopPropagation(); setResumeFile(null); }}
                      className="h-8 w-8 rounded-lg hover:bg-violet-100 text-zinc-400 hover:text-violet-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-zinc-900 text-center">Upload candidate resume</p>
                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest text-center">PDF, DOC, DOCX up to 10MB</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Additional Notes</Label>
              <div className="relative">
                <Info className="absolute left-4 top-3 w-4 h-4 text-zinc-400" />
                <textarea 
                  {...register('notes')}
                  className="w-full min-h-[100px] rounded-xl border border-zinc-200 bg-white pl-11 pr-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 transition-all shadow-sm resize-none"
                  placeholder="Reference candidate profile, specific topics to cover..."
                />
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
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-12 shadow-[0_10px_20px_-5px_rgba(124,58,237,0.3)] font-bold text-xs uppercase tracking-wider transition-all active:scale-95" 
                disabled={isScheduling || isUploading}
              >
                {isScheduling || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Interview'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
