'use client'

import { Bell, Search, LogOut, Menu, User, Settings, KeyRound } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useUIStore } from '@/lib/store/ui-store'
import { cn, getInitials } from '@/lib/utils'
import { useState } from 'react'
import { ChangePasswordModal } from '@/components/settings/change-password-modal'

export function Header() {
  const { data: session } = useSession()
  const { sidebarCollapsed, toggleMobileSidebar } = useUIStore()
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)

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
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

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
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
              <User className="w-4 h-4 text-gray-400" />
              My Profile
            </button>
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
