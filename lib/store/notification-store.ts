import { create } from 'zustand'

export interface Notification {
  _id: string
  type: 'leave' | 'wfh' | 'task' | 'interview' | 'feedback' | 'system'
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
  sender?: {
    name: string
  }
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  setNotifications: (notifications: Notification[]) => void
  setUnreadCount: (count: number) => void
  setIsLoading: (isLoading: boolean) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setIsLoading: (isLoading) => set({ isLoading }),
  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => 
      n._id === id ? { ...n, isRead: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0
  }))
}))
