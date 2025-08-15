import { useEffect, useState, useCallback } from 'react'
import { mongoService, mongoAnalytics, mongoNotifications, mongoSession, DatabaseFactory } from '@/lib/mongodb'
import { useAuth } from '@/contexts/auth-context'

// Hook for MongoDB operations
export function useMongoData<T>(
  collectionName: string, 
  filter: any = {}, 
  options: any = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await mongoService.findMany<T>(collectionName, filter, options)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [collectionName, JSON.stringify(filter), JSON.stringify(options)])

  const createDocument = useCallback(async (documentData: any) => {
    try {
      const result = await mongoService.insertOne<T>(collectionName, documentData)
      if (result) {
        setData(prev => [result, ...prev])
        return result
      }
      return null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
      return null
    }
  }, [collectionName])

  const updateDocument = useCallback(async (documentId: string, updateData: any) => {
    try {
      const success = await mongoService.updateOne(collectionName, { _id: documentId }, updateData)
      if (success) {
        await fetchData() // Refresh data
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
      return false
    }
  }, [collectionName, fetchData])

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      const success = await mongoService.deleteOne(collectionName, { _id: documentId })
      if (success) {
        setData(prev => prev.filter((item: any) => item._id !== documentId))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
      return false
    }
  }, [collectionName])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create: createDocument,
    update: updateDocument,
    delete: deleteDocument
  }
}

// Hook for MongoDB caching with fallback
export function useHybridCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 3600) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get cache service (Redis or MongoDB)
      const cacheService = await DatabaseFactory.getCacheService()
      
      // Try to get from cache first
      const cachedData = await cacheService.get(key)
      
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return cachedData
      }

      // If not in cache, fetch fresh data
      const freshData = await fetcher()
      
      // Cache the fresh data
      await cacheService.set(key, freshData, ttl)
      
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
      const cacheService = await DatabaseFactory.getCacheService()
      await cacheService.del(key)
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

// Hook for MongoDB notifications
export function useMongoNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = useCallback(async () => {
    if (!user) return

    try {
      const userNotifications = await mongoNotifications.getUserNotifications(user.id)
      setNotifications(userNotifications)
      
      const unread = await mongoNotifications.getUnreadCount(user.id)
      setUnreadCount(unread)
    } catch (error) {
      console.error('Fetch notifications error:', error)
    }
  }, [user])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await mongoNotifications.markAsRead(notificationId)
      if (success) {
        setNotifications(prev => 
          prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }, [])

  const sendNotification = useCallback(async (notification: any) => {
    if (!user) return

    try {
      await mongoNotifications.sendNotification(user.id, notification)
      await fetchNotifications() // Refresh notifications
    } catch (error) {
      console.error('Send notification error:', error)
    }
  }, [user, fetchNotifications])

  useEffect(() => {
    fetchNotifications()
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    markAsRead,
    sendNotification,
    refresh: fetchNotifications
  }
}

// Hook for MongoDB analytics
export function useMongoAnalytics() {
  const { user } = useAuth()

  const trackActivity = useCallback(async (activity: string, metadata?: any) => {
    if (!user) return

    try {
      const analyticsService = await DatabaseFactory.getAnalyticsService()
      await analyticsService.trackActivity(user.id, activity, metadata)
    } catch (error) {
      console.error('Track activity error:', error)
    }
  }, [user])

  const getUserStats = useCallback(async (days: number = 7) => {
    if (!user) return {}

    try {
      const analyticsService = await DatabaseFactory.getAnalyticsService()
      return await analyticsService.getUserActivityStats(user.id, days)
    } catch (error) {
      console.error('Get user stats error:', error)
      return {}
    }
  }, [user])

  const getGlobalMetrics = useCallback(async (activity: string, days: number = 30) => {
    try {
      const analyticsService = await DatabaseFactory.getAnalyticsService()
      return await analyticsService.getGlobalMetrics(activity, days)
    } catch (error) {
      console.error('Get global metrics error:', error)
      return []
    }
  }, [])

  return {
    trackActivity,
    getUserStats,
    getGlobalMetrics
  }
}

// Hook for MongoDB session management
export function useMongoSession() {
  const { user } = useAuth()

  const createSession = useCallback(async (sessionData: any, ttl: number = 28800) => {
    if (!user) return null

    try {
      const sessionService = await DatabaseFactory.getSessionService()
      return await sessionService.createSession(user.id, sessionData, ttl)
    } catch (error) {
      console.error('Create session error:', error)
      return null
    }
  }, [user])

  const getActiveSessions = useCallback(async () => {
    if (!user) return []

    try {
      const sessionService = await DatabaseFactory.getSessionService()
      return await sessionService.getUserSessions(user.id)
    } catch (error) {
      console.error('Get active sessions error:', error)
      return []
    }
  }, [user])

  const terminateSession = useCallback(async (sessionId: string) => {
    try {
      const sessionService = await DatabaseFactory.getSessionService()
      return await sessionService.deleteSession(sessionId)
    } catch (error) {
      console.error('Terminate session error:', error)
      return false
    }
  }, [])

  const terminateAllSessions = useCallback(async () => {
    if (!user) return false

    try {
      const sessionService = await DatabaseFactory.getSessionService()
      return await sessionService.deleteAllUserSessions(user.id)
    } catch (error) {
      console.error('Terminate all sessions error:', error)
      return false
    }
  }, [user])

  return {
    createSession,
    getActiveSessions,
    terminateSession,
    terminateAllSessions
  }
}

// Hook for database health monitoring
export function useDatabaseHealth() {
  const [redisHealth, setRedisHealth] = useState<boolean | null>(null)
  const [mongoHealth, setMongoHealth] = useState<boolean | null>(null)
  const [preferredDb, setPreferredDb] = useState<'redis' | 'mongodb' | 'both' | null>(null)

  const checkHealth = useCallback(async () => {
    try {
      // Check Redis health
      try {
        const { checkRedisHealth } = await import('@/lib/redis')
        const redisStatus = await checkRedisHealth()
        setRedisHealth(redisStatus)
      } catch {
        setRedisHealth(false)
      }

      // Check MongoDB health
      try {
        const { checkMongoHealth } = await import('@/lib/mongodb')
        const mongoStatus = await checkMongoHealth()
        setMongoHealth(mongoStatus)
      } catch {
        setMongoHealth(false)
      }

      // Determine preferred database
      const preferred = await DatabaseFactory.getPreferredDatabase()
      setPreferredDb(preferred)
    } catch (error) {
      console.error('Database health check error:', error)
    }
  }, [])

  useEffect(() => {
    checkHealth()
    
    // Check health every 60 seconds
    const interval = setInterval(checkHealth, 60000)
    
    return () => clearInterval(interval)
  }, [checkHealth])

  return {
    redisHealth,
    mongoHealth,
    preferredDb,
    checkHealth
  }
}

// Hook for hybrid data operations (Redis + MongoDB)
export function useHybridData<T>(
  collectionName: string,
  cacheKey: string,
  filter: any = {},
  options: any = {},
  cacheTtl: number = 3600
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try cache first
      const cacheService = await DatabaseFactory.getCacheService()
      const cachedData = await cacheService.get(cacheKey)
      
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return cachedData
      }

      // Fetch from MongoDB
      const freshData = await mongoService.findMany<T>(collectionName, filter, options)
      
      // Cache the data
      await cacheService.set(cacheKey, freshData, cacheTtl)
      
      setData(freshData)
      setLoading(false)
      return freshData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
      return []
    }
  }, [collectionName, cacheKey, JSON.stringify(filter), JSON.stringify(options), cacheTtl])

  const invalidateCache = useCallback(async () => {
    try {
      const cacheService = await DatabaseFactory.getCacheService()
      await cacheService.del(cacheKey)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invalidate cache')
    }
  }, [cacheKey, fetchData])

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