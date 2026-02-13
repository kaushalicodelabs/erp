'use client'

import { Bell, Search, LogOut, Menu, User, Settings, KeyRound, Check, Clock as ClockIcon, ExternalLink } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useUIStore } from '@/lib/store/ui-store'
import { cn, getInitials } from '@/lib/utils'
import { useState } from 'react'
import { ChangePasswordModal } from '@/components/settings/change-password-modal'
import { useNotifications } from '@/lib/hooks/use-notifications'
import { formatDistanceToNow } from 'date-fns'

export function Header() {
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleMobileSidebar } = useUIStore()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 bg-white border-b border-gray-200/80 transition-all duration-300 ease-in-out flex items-center px-4 lg:px-6',
        sidebarCollapsed ? 'lg:left-[70px]' : 'lg:left-[250px]',
        'left-0'
      )}
    >
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
      
      {/* Mobile Toggle */}
      <button 
        onClick={toggleMobileSidebar}
        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 mr-2"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full h-10 bg-gray-100/50 border-none rounded-xl pl-10 pr-4 text-sm focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <div className="group relative">
          <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-all duration-200">
            <Bell className="w-5 h-5 transition-transform group-hover:scale-110" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white animate-in zoom-in duration-300">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-zinc-50/50">
              <p className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[8px]">{unreadCount} New</span>}
              </p>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-violet-600 hover:text-violet-700 uppercase tracking-tighter"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n._id} className={cn(
                    "p-4 transition-colors relative group/item",
                    !n.isRead ? "bg-violet-50/30" : "hover:bg-gray-50/50"
                  )}>
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm",
                        n.type === 'leave' ? "bg-amber-50 text-amber-600" :
                        n.type === 'task' ? "bg-emerald-50 text-emerald-600" :
                        n.type === 'interview' ? "bg-blue-50 text-blue-600" :
                        "bg-violet-50 text-violet-600"
                      )}>
                        {n.type === 'leave' ? <Settings className="w-4 h-4" /> : 
                         n.type === 'task' ? <Check className="w-4 h-4" /> : 
                         <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-gray-900 tracking-tight leading-tight mb-1">{n.title}</p>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed truncate-2-lines mb-2">{n.message}</p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                          <ClockIcon className="w-3 h-3" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!n.isRead && (
                          <button 
                            onClick={() => markAsRead(n._id)}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-100 shadow-sm transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        {n.link && (
                          <Link 
                            href={n.link}
                            className="w-6 h-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-violet-600 hover:border-violet-100 shadow-sm transition-all"
                            title="View Details"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Bell className="w-8 h-8 text-gray-100 mx-auto mb-3" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All caught up!</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 bg-zinc-50/50 border-t border-gray-50 text-center flex flex-col gap-2">
                <Link 
                  href="/notifications"
                  className="text-[10px] font-black text-violet-600 uppercase tracking-widest hover:underline"
                >
                  See all notifications
                </Link>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">End of notifications</p>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

        <div className="group relative">
          <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 transition-all duration-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">{session?.user?.name}</p>
              <p className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">{session?.user?.role?.replace('_', ' ')}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-200">
              {getInitials(session?.user?.name || '')}
            </div>
          </button>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1.5">
            <div className="p-3 border-b border-gray-50 mb-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account Settings</p>
            </div>
            <Link 
              href="/profile"
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
            >
              <User className="w-4 h-4 text-gray-400" />
              My Profile
            </Link>
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
            >
              <KeyRound className="w-4 h-4 text-gray-400" />
              Change Password
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
              Preferences
            </button>
            <div className="h-px bg-gray-50 my-1.5" />
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
