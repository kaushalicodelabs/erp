import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useNotificationStore, Notification } from '../store/notification-store'

export function useNotifications() {
  const { data: session } = useSession()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    setNotifications, 
    setUnreadCount, 
    setIsLoading,
    markAsRead: markReadInStore,
    markAllAsRead: markAllReadInStore
  } = useNotificationStore()

  const fetchNotifications = useCallback(async () => {
    if (!session) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=20')
      const data = await res.json()
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session, setIsLoading, setNotifications, setUnreadCount])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' })
      markReadInStore(id)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      markAllReadInStore()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchNotifications()
      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000)
      return () => clearInterval(interval)
    }
  }, [session, fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  }
}
