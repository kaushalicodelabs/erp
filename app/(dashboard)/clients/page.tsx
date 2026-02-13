'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClients } from '@/lib/hooks/use-clients'
import { 
  Building2, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Globe, 
  ExternalLink,
  MoreVertical,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AddClientModal } from '@/components/dashboard/add-client-modal'
import { Pagination } from '@/components/ui/pagination-common'

export default function ClientsPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 8
  const [searchQuery, setSearchQuery] = useState('')
  const { clients, total, pageCount, isLoading } = useClients(currentPage, itemsPerPage, searchQuery)
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePageChange = (selected: number) => {
    setCurrentPage(selected)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(0) // Reset to first page on search
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your business partners and client relationships.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>
      </div>

      <AddClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search clients by company, contact or email..." 
            className="pl-10 h-11"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" className="h-11 gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients?.map((client) => (
          <div key={client._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-violet-200 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{client.companyName}</h3>
                <p className="text-sm font-medium text-gray-500">{client.contactPerson}</p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
                {client.website && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 hover:underline flex items-center gap-1">
                      {client.website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50">
              <Button 
                variant="outline" 
                className="w-full text-xs font-bold uppercase tracking-wider h-10 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                onClick={() => router.push(`/projects?clientId=${client._id}`)}
              >
                View Projects
              </Button>
            </div>
          </div>
        ))}
        {(!clients || clients.length === 0) && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Building2 className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No clients found</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-2 text-sm">We couldn&apos;t find any clients matching your search criteria.</p>
              <Button variant="ghost" className="mt-4 text-violet-600 font-bold" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
          </div>
        )}
      </div>

      <Pagination 
        pageCount={pageCount || 0}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  )
}
