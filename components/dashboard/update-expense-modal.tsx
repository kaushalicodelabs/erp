'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Receipt, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useExpenses } from '@/lib/hooks/use-expenses'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect } from 'react'
import { Expense } from '@/types'

const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  receipt: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const CATEGORIES = [
  'Travel',
  'Office Supplies',
  'Software/Subscriptions',
  'Meals/Entertainment',
  'Hardware',
  'Internet/Utilities',
  'Marketing',
  'Other'
]

export function UpdateExpenseModal({ 
  isOpen, 
  onClose, 
  expense 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  expense: Expense | null 
}) {
  const { updateExpense, isUpdating } = useExpenses()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as any,
  })

  useEffect(() => {
    if (expense) {
      reset({
        category: expense.category,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split('T')[0],
        description: expense.description,
        receipt: expense.receipt || '',
      })
    }
  }, [expense, reset])

  const onSubmit = (data: ExpenseFormValues) => {
    if (!expense) return

    updateExpense({ 
      id: expense._id, 
      data: data as any 
    }, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-violet-600" />
            Update Expense Claim
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category" 
                  {...register('category')}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" step="0.01" {...register('amount')} className="h-11 rounded-xl" />
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" {...register('date')} className="h-11 rounded-xl" />
                  {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea 
                  id="description" 
                  {...register('description')}
                  className="w-full min-h-[100px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-sans"
                  placeholder="What was this expense for?"
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt URL (Optional)</Label>
                <Input id="receipt" {...register('receipt')} placeholder="https://storage.com/receipt.pdf" className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400 mr-auto flex items-center gap-1">
                Editing: EXT-{expense?._id.toString().slice(-6).toUpperCase()}
              </span>
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-violet-200" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
