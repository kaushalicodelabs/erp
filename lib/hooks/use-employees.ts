'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/axios'
import { Employee } from '@/types'
import { toast } from 'sonner'

export function useEmployees() {
  const queryClient = useQueryClient()

  // Fetch all employees
  const { data: employees, isLoading, error } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data } = await api.get('/employees')
      return data
    },
  })

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: async (newEmployee: Partial<Employee>) => {
      const { data } = await api.post('/employees', newEmployee)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee added successfully')
    },
    onError: (err: any) => {
      toast.error(err.message)
    }
  })

  // Update employee mutation
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<Employee> }) => {
      const { data } = await api.put(`/employees/${id}`, updateData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee updated successfully')
    },
  })

  // Delete employee mutation
  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/employees/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      toast.success('Employee removed successfully')
    },
  })

  return {
    employees,
    isLoading,
    error,
    createEmployee: createEmployeeMutation.mutate,
    isCreating: createEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutate,
    isUpdating: updateEmployeeMutation.isPending,
    deleteEmployee: deleteEmployeeMutation.mutate,
    isDeleting: deleteEmployeeMutation.isPending,
  }
}
