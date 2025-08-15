import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useMongoNotifications, useMongoAnalytics, useMongoSession } from './use-mongodb'

// Hook for Redis caching
export function useRedisCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 3600) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch fresh data
      const freshData = await fetcher()
      
      setData(freshData)
      setLoading(false)
      return freshData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return null
    }
  }, [key, fetcher, ttl])

  const invalidateCache = useCallback(async () => {
    try {
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invalidate cache')
    }
  }, [key, fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidate: invalidateCache
  }
}

// Hook for real-time notifications
export function useRedisNotifications() {
  // Use MongoDB notifications as fallback
  return useMongoNotifications()
}

// Hook for user activity tracking
export function useActivityTracker() {
  // Use MongoDB analytics as fallback
  return useMongoAnalytics()
}

// Hook for session management
export function useSessionManager() {
  // Use MongoDB sessions as fallback
  return useMongoSession()
}

// Hook for online users
export function useOnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const updateOnlineStatus = async () => {
      try {
        // Fallback to mock online users
        setOnlineUsers([user.id, 'user1', 'user2'])
      } catch (error) {
        console.error('Update online status error:', error)
      }
    }

    updateOnlineStatus()

    // Update online status every 30 seconds
    const interval = setInterval(updateOnlineStatus, 30000)

    // Set offline on unmount
    return () => {
      clearInterval(interval)
    }
  }, [user])

  return onlineUsers
}

// Hook for system metrics
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<any>({})
  const [loading, setLoading] = useState(true)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      
      // Mock metrics for client-side
      const freshMetrics = {
        totalUsers: 156,
        totalCustomers: 1247,
        totalSims: 3403,
        activeSims: 2156,
        todayTransactions: 89,
        totalRevenue: 12450,
        timestamp: new Date().toISOString()
      }

      setMetrics(freshMetrics)
      setLoading(false)
    } catch (error) {
      console.error('Fetch metrics error:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
    
    // Refresh metrics every 5 minutes
    const interval = setInterval(fetchMetrics, 300000)
    
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    refresh: fetchMetrics
  }
}