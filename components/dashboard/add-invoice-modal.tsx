'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, Trash2, Loader2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInvoices } from '@/lib/hooks/use-invoices'
import { useClients } from '@/lib/hooks/use-clients'
import { useProjects } from '@/lib/hooks/use-projects'
import { useEffect } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Please select a client'),
  projectId: z.string().optional(),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.coerce.number().min(1, 'Min 1'),
    rate: z.coerce.number().min(0, 'Min 0'),
    amount: z.number().default(0),
  })).min(1, 'At least one item is required'),
  subtotal: z.number().default(0),
  tax: z.coerce.number().min(0).default(0),
  total: z.number().default(0),
  notes: z.string().optional(),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

export function AddInvoiceModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { createInvoice, isCreating } = useInvoices()
  const { clients } = useClients()
  const { projects } = useProjects()
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      clientId: '',
      projectId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const watchedItems = watch('items')
  const watchedTax = watch('tax')

  useEffect(() => {
    let subtotal = 0
    watchedItems.forEach((item, index) => {
      const amount = (item.quantity || 0) * (item.rate || 0)
      if (item.amount !== amount) {
        setValue(`items.${index}.amount` as any, amount)
      }
      subtotal += amount
    })
    
    setValue('subtotal', subtotal)
    setValue('total', subtotal + (Number(watchedTax) || 0))
  }, [watchedItems, watchedTax, setValue])

  const onSubmit = (data: InvoiceFormValues) => {
    createInvoice(data as any, {
      onSuccess: () => {
        reset()
        onClose()
      }
    })
  }

  const subtotal = watch('subtotal')
  const total = watch('total')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            Generate New Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[85vh]">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Client</Label>
                <select 
                  {...register('clientId')}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Select Client</option>
                  {clients?.map(c => (
                    <option key={c._id} value={c._id}>{c.companyName}</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Project (Optional)</Label>
                <select 
                  {...register('projectId')}
                  className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                >
                  <option value="">Select Project</option>
                  {projects?.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" {...register('issueDate')} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" {...register('dueDate')} className="h-11 rounded-xl" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Line Items</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => append({ description: '', quantity: 1, rate: 0, amount: 0 })}
                  className="h-9 px-3 rounded-lg border-violet-200 text-violet-600 hover:bg-violet-50 font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-12 gap-3 items-start animate-in slide-in-from-right-2 duration-300">
                    <div className="col-span-6">
                      <Input 
                        placeholder="Item description..." 
                        {...register(`items.${index}.description`)} 
                        className="rounded-xl"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        placeholder="Qty" 
                        {...register(`items.${index}.quantity`)} 
                        className="rounded-xl text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        placeholder="Rate" 
                        {...register(`items.${index}.rate`)} 
                        className="rounded-xl text-right"
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="flex-1 text-right text-sm font-bold text-gray-700 pt-3">
                        ${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0)).toLocaleString()}
                      </div>
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => remove(index)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 pt-6 border-t border-gray-100">
              <div className="flex-1 space-y-3">
                <Label>Notes</Label>
                <textarea 
                  {...register('notes')}
                  className="w-full min-h-[100px] rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  placeholder="Thank you for your business!"
                />
              </div>
              <div className="w-full md:w-64 space-y-4">
                <div className="flex justify-between items-center text-sm font-medium text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <Label className="text-sm font-medium text-gray-500">Tax ($)</Label>
                  <Input 
                    type="number" 
                    {...register('tax')} 
                    className="h-9 w-24 rounded-lg text-right font-bold"
                  />
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-black text-violet-600">${total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-12 px-6">Cancel</Button>
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-violet-200" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate & Save'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { FileText } from 'lucide-react'
