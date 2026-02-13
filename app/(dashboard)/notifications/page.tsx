'use client'

import { Bell, Check, Clock as ClockIcon, ExternalLink, Filter, Trash2 } from 'lucide-react'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread' | 'leave' | 'task' | 'interview'>('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'all') return true
    return n.type === filter
  })

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Notifications
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            Stay updated with your latest activities and requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-bold text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {(['all', 'unread', 'leave', 'task', 'interview'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
              filter === f 
                ? "bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200" 
                : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((n) => (
              <div 
                key={n._id} 
                className={cn(
                  "p-5 transition-all relative group",
                  !n.isRead ? "bg-violet-50/30" : "hover:bg-gray-50/50"
                )}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" />
                )}
                
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                    n.type === 'leave' ? "bg-amber-50 text-amber-600" :
                    n.type === 'task' ? "bg-emerald-50 text-emerald-600" :
                    n.type === 'interview' ? "bg-blue-50 text-blue-600" :
                    "bg-violet-50 text-violet-600"
                  )}>
                    {n.type === 'leave' ? <ClockIcon className="w-5 h-5" /> : 
                     n.type === 'task' ? <Check className="w-5 h-5" /> : 
                     <Bell className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="text-sm font-black text-gray-900 tracking-tight leading-tight">
                        {n.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter shrink-0">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3">
                      {!n.isRead && (
                        <button 
                          onClick={() => markAsRead(n._id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-violet-600 hover:border-violet-100 hover:bg-violet-50 transition-all shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Read
                        </button>
                      )}
                      
                      {n.link && (
                        <Link 
                          href={n.link}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-black transition-all shadow-md shadow-gray-200"
                        >
                          View Details
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-2">No notifications found</h3>
            <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto">
              We couldn't find any notifications matching your current filter.
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-8 p-6 bg-zinc-50 rounded-3xl border border-dashed border-gray-200 flex items-center gap-4 text-center justify-center">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
           Notifications are automatically cleared after 30 days
         </p>
      </div>
    </div>
  )
}
