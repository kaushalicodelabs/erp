'use client'

import ReactPaginate from 'react-paginate'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  pageCount: number
  onPageChange: (selected: number) => void
  currentPage: number
  className?: string
}

export function Pagination({ pageCount, onPageChange, currentPage, className }: PaginationProps) {
  if (pageCount <= 1) return null

  const handlePageClick = ({ selected }: { selected: number }) => {
    onPageChange(selected)
  }

  return (
    <div className={cn("flex justify-center mt-8", className)}>
      <ReactPaginate
        previousLabel={<ChevronLeft className="w-4 h-4" />}
        nextLabel={<ChevronRight className="w-4 h-4" />}
        pageCount={pageCount}
        onPageChange={handlePageClick}
        forcePage={currentPage}
        containerClassName={'flex items-center gap-2'}
        pageClassName={'px-3 py-1 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors'}
        activeClassName={'!bg-violet-600 !text-white !border-violet-600'}
        previousClassName={'px-2 py-1 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center'}
        nextClassName={'px-2 py-1 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center'}
        disabledClassName={'opacity-50 cursor-not-allowed'}
        breakLabel={'...'}
        breakClassName={'px-3 py-1'}
      />
    </div>
  )
}
