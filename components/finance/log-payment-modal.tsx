'use client'

import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePayments } from '@/lib/hooks/use-payments'
import { useInvoices } from '@/lib/hooks/use-invoices'
import { CreditCard, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react'

interface LogPaymentModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LogPaymentModal({ isOpen, onClose }: LogPaymentModalProps) {
  const { logPayment, isLogging } = usePayments()
  const { invoices } = useInvoices()
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      invoiceId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'bank_transfer',
      reference: '',
      notes: ''
    }
  })

  const onSubmit = (data: any) => {
    logPayment({
      ...data,
      amount: parseFloat(data.amount)
    }, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  // Filter only unpaid/sent invoices
  const pendingInvoices = invoices?.filter((inv: any) => inv.status !== 'paid') || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-0 overflow-hidden bg-white">
        <DialogHeader className="p-8 bg-violet-600 text-white">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold">Log New Payment</DialogTitle>
          <p className="text-violet-100 text-sm opacity-90">Record a settlement against an outstanding invoice.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Select Invoice</Label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  {...register('invoiceId', { required: 'Invoice is required' })}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium"
                >
                  <option value="">Select an invoice...</option>
                  {pendingInvoices.map((inv: any) => (
                    <option key={inv._id} value={inv._id}>
                      INV-{inv.invoiceNumber || inv._id.slice(-6).toUpperCase()} - {inv.clientName} (${inv.total})
                    </option>
                  ))}
                </select>
              </div>
              {errors.invoiceId && <p className="text-xs font-bold text-red-500 pl-1">{errors.invoiceId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Amount Paid</Label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    {...register('amount', { required: 'Amount is required' })}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="h-12 pl-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-bold"
                  />
                </div>
                {errors.amount && <p className="text-xs font-bold text-red-500 pl-1">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Payment Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    {...register('date')}
                    type="date"
                    className="h-12 pl-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Payment Method</Label>
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  {...register('method')}
                  className="w-full h-12 pl-12 pr-4 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm font-medium"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1 font-sans">Reference / Transaction ID</Label>
              <Input
                {...register('reference')}
                placeholder="TXN123456789"
                className="h-12 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLogging}
              className="flex-1 h-12 rounded-xl font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 gap-2"
            >
              {isLogging ? 'Logging...' : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Record Payment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
