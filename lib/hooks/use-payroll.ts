'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Payroll } from '@/types'
import { toast } from 'sonner'

export function usePayroll(filters?: { month?: number; year?: number }) {
  const queryClient = useQueryClient()

  const { data: payrolls, isLoading, error } = useQuery<Payroll[]>({
    queryKey: ['payrolls', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/payroll', { params: filters })
      return data
    },
  })

  const generatePayrollMutation = useMutation({
    mutationFn: async (params: { month: number; year: number }) => {
      const { data } = await api.post('/finance/payroll', params)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payrolls'] })
      queryClient.invalidateQueries({ queryKey: ['salaries'] })
      toast.success(data.message || 'Payroll generated successfully')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to generate payroll')
    }
  })

  return {
    payrolls,
    isLoading,
    error,
    generatePayroll: generatePayrollMutation.mutate,
    isGenerating: generatePayrollMutation.isPending,
  }
}
