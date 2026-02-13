'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Invoice } from '@/types'
import { toast } from 'sonner'

export function useInvoices(filters?: { status?: string; clientId?: string }) {
  const queryClient = useQueryClient()

  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      const { data } = await api.get('/finance/invoices', { params: filters })
      return data
    },
  })

  const createInvoiceMutation = useMutation({
    mutationFn: async (newInvoice: Partial<Invoice>) => {
      const { data } = await api.post('/finance/invoices', newInvoice)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
      const { data: result } = await api.put(`/finance/invoices/${id}`, data)
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice updated successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  return {
    invoices,
    isLoading,
    error,
    createInvoice: createInvoiceMutation.mutate,
    isCreating: createInvoiceMutation.isPending,
    updateInvoice: updateInvoiceMutation.mutate,
    isUpdating: updateInvoiceMutation.isPending,
  }
}
