'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, DollarSign, Wallet, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSalaries } from '@/lib/hooks/use-salaries'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Salary, Employee } from '@/types'
import { useEffect } from 'react'

const salarySchema = z.object({
  baseSalary: z.coerce.number().min(0, 'Salary must be positive'),
  paymentFrequency: z.enum(['monthly', 'bi-weekly', 'weekly']),
  currency: z.string().default('USD'),
  status: z.enum(['active', 'inactive']).default('active'),
  bankDetails: z.object({
    bankName: z.string().min(2, 'Bank name required'),
    accountNumber: z.string().min(5, 'Account number required'),
    ifscCode: z.string().min(2, 'Sort code/IFSC required'),
  })
})

type SalaryFormValues = z.infer<typeof salarySchema>

interface UpdateSalaryModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee | null
  existingSalary?: Salary | null
}

export function UpdateSalaryModal({ isOpen, onClose, employee, existingSalary }: UpdateSalaryModalProps) {
  const { updateSalary, isUpdating } = useSalaries()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema) as any,
    defaultValues: {
      baseSalary: 0,
      paymentFrequency: 'monthly',
      currency: 'USD',
      status: 'active',
      bankDetails: {
        bankName: '',
        accountNumber: '',
        ifscCode: '',
      }
    }
  })

  useEffect(() => {
    if (existingSalary) {
      reset({
        baseSalary: existingSalary.baseSalary,
        paymentFrequency: existingSalary.paymentFrequency,
        currency: existingSalary.currency,
        status: existingSalary.status,
        bankDetails: {
          bankName: existingSalary.bankDetails?.bankName || '',
          accountNumber: existingSalary.bankDetails?.accountNumber || '',
          ifscCode: existingSalary.bankDetails?.ifscCode || '',
        }
      })
    } else {
      reset({
        baseSalary: 0,
        paymentFrequency: 'monthly',
        currency: 'USD',
        status: 'active',
        bankDetails: {
          bankName: '',
          accountNumber: '',
          ifscCode: '',
        }
      })
    }
  }, [existingSalary, reset])

  const onSubmit = (data: SalaryFormValues) => {
    if (!employee) return
    updateSalary({ id: employee._id, data: data as any }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  if (!employee) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Payroll Setup: {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Wallet className="w-4 h-4 text-violet-500" />
                  Base Salary ($)
                </Label>
                <Input type="number" {...register('baseSalary')} className="h-11 rounded-xl" />
                {errors.baseSalary && <p className="text-xs text-red-500">{errors.baseSalary.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <select 
                  {...register('paymentFrequency')}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-Weekly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <Label className="flex items-center gap-2 text-gray-900 font-bold">
                <Building2 className="w-4 h-4 text-blue-500" />
                Bank Information
              </Label>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input {...register('bankDetails.bankName')} placeholder="e.g. Chase Bank" className="h-11 rounded-xl" />
                  {errors.bankDetails?.bankName && <p className="text-xs text-red-500">{errors.bankDetails.bankName.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input {...register('bankDetails.accountNumber')} className="h-11 rounded-xl" />
                    {errors.bankDetails?.accountNumber && <p className="text-xs text-red-500">{errors.bankDetails.accountNumber.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Sort Code / IFSC</Label>
                    <Input {...register('bankDetails.ifscCode')} className="h-11 rounded-xl" />
                    {errors.bankDetails?.ifscCode && <p className="text-xs text-red-500">{errors.bankDetails.ifscCode.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-violet-200" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Payroll Config'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
