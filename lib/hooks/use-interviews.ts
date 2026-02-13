import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Interview, InterviewFeedback } from '@/types'
import { toast } from 'sonner'

export function useInterviews(page: number = 0, limit: number = 10, status: string = 'all') {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ interviews: Interview[], total: number, pageCount: number }>({
    queryKey: ['interviews', page, limit, status],
    queryFn: async () => {
      const { data } = await api.get('/interviews', { params: { page, limit, status } })
      return data
    }
  })

  const scheduleInterview = useMutation({
    mutationFn: async (data: Partial<Interview>) => {
      const { data: result } = await api.post('/interviews', data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Interview scheduled successfully')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to schedule interview')
    }
  })

  const updateInterview = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Interview> }) => {
      const { data: result } = await api.patch(`/interviews/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Interview updated')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update interview')
    }
  })

  const submitFeedback = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<InterviewFeedback> }) => {
      const { data: result } = await api.post(`/interviews/${id}/feedback`, data)
      return result
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      queryClient.invalidateQueries({ queryKey: ['interview-feedback', variables.id] })
      toast.success('Feedback submitted successfully')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit feedback')
    }
  })

  const interviewFeedback = (id: string) => {
    return useQuery<InterviewFeedback[]>({
      queryKey: ['interview-feedback', id],
      queryFn: async () => {
        const { data } = await api.get(`/interviews/${id}/feedback`)
        return data
      },
      enabled: !!id
    })
  }

  return {
    interviews: data?.interviews,
    total: data?.total,
    pageCount: data?.pageCount,
    isLoading,
    scheduleInterview: scheduleInterview.mutate,
    isScheduling: scheduleInterview.isPending,
    updateInterview: updateInterview.mutate,
    isUpdating: updateInterview.isPending,
    submitFeedback: submitFeedback.mutate,
    isSubmittingFeedback: submitFeedback.isPending,
    useInterviewFeedback: interviewFeedback
  }
}
