'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { toast } from 'sonner'

export function usePayments() {
  const queryClient = useQueryClient()

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await api.get('/finance/payments')
      return data
    }
  })

  const createPaymentMutation = useMutation({
    mutationFn: async (newPayment: any) => {
      const { data } = await api.post('/finance/payments', newPayment)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['financial-reports'] })
      toast.success('Payment logged successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to log payment')
    }
  })

  return {
    payments,
    isLoading,
    error,
    logPayment: createPaymentMutation.mutate,
    isLogging: createPaymentMutation.isPending
  }
}
