import Redis from 'ioredis'

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 60000,
  commandTimeout: 5000,
}

// Create Redis client instance
let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig)
    
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })
    
    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })
    
    redis.on('ready', () => {
      console.log('🚀 Redis is ready to accept commands')
    })
  }
  
  return redis
}

// Cache utilities
export class RedisCache {
  private redis: Redis
  
  constructor() {
    this.redis = getRedisClient()
  }
  
  // Set cache with TTL (time to live in seconds)
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)
      await this.redis.setex(key, ttl, serializedValue)
    } catch (error) {
      console.error('Redis SET error:', error)
      throw error
    }
  }
  
  // Get cached value
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis GET error:', error)
      return null
    }
  }
  
  // Delete cache key
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Redis DEL error:', error)
      throw error
    }
  }
  
  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis EXISTS error:', error)
      return false
    }
  }
  
  // Set with expiration
  async setWithExpiry(key: string, value: any, seconds: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)
      await this.redis.setex(key, seconds, serializedValue)
    } catch (error) {
      console.error('Redis SETEX error:', error)
      throw error
    }
  }
  
  // Increment counter
  async increment(key: string, amount: number = 1): Promise<number> {
    try {
      return await this.redis.incrby(key, amount)
    } catch (error) {
      console.error('Redis INCR error:', error)
      throw error
    }
  }
  
  // Get multiple keys
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.redis.mget(...keys)
    } catch (error) {
      console.error('Redis MGET error:', error)
      return []
    }
  }
  
  // Set multiple keys
  async mset(keyValuePairs: Record<string, any>): Promise<void> {
    try {
      const pairs: string[] = []
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pairs.push(key, JSON.stringify(value))
      })
      await this.redis.mset(...pairs)
    } catch (error) {
      console.error('Redis MSET error:', error)
      throw error
    }
  }
  
  // Get keys by pattern
  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern)
    } catch (error) {
      console.error('Redis KEYS error:', error)
      return []
    }
  }
  
  // Clear all cache
  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall()
    } catch (error) {
      console.error('Redis FLUSHALL error:', error)
      throw error
    }
  }
}

// Session management
export class RedisSessionManager {
  private redis: Redis
  private sessionPrefix = 'session:'
  private userSessionPrefix = 'user_sessions:'
  
  constructor() {
    this.redis = getRedisClient()
  }
  
  // Create user session
  async createSession(userId: string, sessionData: any, ttl: number = 28800): Promise<string> {
    try {
      const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionKey = `${this.sessionPrefix}${sessionId}`
      const userSessionKey = `${this.userSessionPrefix}${userId}`
      
      // Store session data
      await this.redis.setex(sessionKey, ttl, JSON.stringify({
        ...sessionData,
        userId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
      }))
      
      // Track user sessions
      await this.redis.sadd(userSessionKey, sessionId)
      await this.redis.expire(userSessionKey, ttl)
      
      return sessionId
    } catch (error) {
      console.error('Redis session creation error:', error)
      throw error
    }
  }
  
  // Get session data
  async getSession(sessionId: string): Promise<any | null> {
    try {
      const sessionKey = `${this.sessionPrefix}${sessionId}`
      const sessionData = await this.redis.get(sessionKey)
      return sessionData ? JSON.parse(sessionData) : null
    } catch (error) {
      console.error('Redis session get error:', error)
      return null
    }
  }
  
  // Update session
  async updateSession(sessionId: string, data: any): Promise<void> {
    try {
      const sessionKey = `${this.sessionPrefix}${sessionId}`
      const existingData = await this.getSession(sessionId)
      if (existingData) {
        const updatedData = { ...existingData, ...data }
        const ttl = await this.redis.ttl(sessionKey)
        await this.redis.setex(sessionKey, ttl > 0 ? ttl : 3600, JSON.stringify(updatedData))
      }
    } catch (error) {
      console.error('Redis session update error:', error)
      throw error
    }
  }
  
  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessionKey = `${this.sessionPrefix}${sessionId}`
      const sessionData = await this.getSession(sessionId)
      
      if (sessionData?.userId) {
        const userSessionKey = `${this.userSessionPrefix}${sessionData.userId}`
        await this.redis.srem(userSessionKey, sessionId)
      }
      
      await this.redis.del(sessionKey)
    } catch (error) {
      console.error('Redis session delete error:', error)
      throw error
    }
  }
  
  // Get all user sessions
  async getUserSessions(userId: string): Promise<string[]> {
    try {
      const userSessionKey = `${this.userSessionPrefix}${userId}`
      return await this.redis.smembers(userSessionKey)
    } catch (error) {
      console.error('Redis get user sessions error:', error)
      return []
    }
  }
  
  // Delete all user sessions
  async deleteAllUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId)
      const pipeline = this.redis.pipeline()
      
      sessions.forEach(sessionId => {
        pipeline.del(`${this.sessionPrefix}${sessionId}`)
      })
      
      pipeline.del(`${this.userSessionPrefix}${userId}`)
      await pipeline.exec()
    } catch (error) {
      console.error('Redis delete all user sessions error:', error)
      throw error
    }
  }
}

// Real-time notifications
export class RedisNotificationManager {
  private redis: Redis
  private notificationPrefix = 'notifications:'
  private userNotificationPrefix = 'user_notifications:'
  
  constructor() {
    this.redis = getRedisClient()
  }
  
  // Send notification to user
  async sendNotification(userId: string, notification: any): Promise<void> {
    try {
      const notificationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const notificationKey = `${this.notificationPrefix}${notificationId}`
      const userNotificationKey = `${this.userNotificationPrefix}${userId}`
      
      const notificationData = {
        id: notificationId,
        ...notification,
        createdAt: new Date().toISOString(),
        read: false
      }
      
      // Store notification
      await this.redis.setex(notificationKey, 86400 * 7, JSON.stringify(notificationData)) // 7 days TTL
      
      // Add to user's notification list
      await this.redis.lpush(userNotificationKey, notificationId)
      await this.redis.expire(userNotificationKey, 86400 * 7)
      
      // Publish real-time notification
      await this.redis.publish(`user:${userId}:notifications`, JSON.stringify(notificationData))
    } catch (error) {
      console.error('Redis notification send error:', error)
      throw error
    }
  }
  
  // Get user notifications
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const userNotificationKey = `${this.userNotificationPrefix}${userId}`
      const notificationIds = await this.redis.lrange(userNotificationKey, 0, limit - 1)
      
      if (notificationIds.length === 0) return []
      
      const notifications = await Promise.all(
        notificationIds.map(async (id) => {
          const notificationKey = `${this.notificationPrefix}${id}`
          const data = await this.redis.get(notificationKey)
          return data ? JSON.parse(data) : null
        })
      )
      
      return notifications.filter(Boolean)
    } catch (error) {
      console.error('Redis get notifications error:', error)
      return []
    }
  }
  
  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationKey = `${this.notificationPrefix}${notificationId}`
      const data = await this.redis.get(notificationKey)
      
      if (data) {
        const notification = JSON.parse(data)
        notification.read = true
        notification.readAt = new Date().toISOString()
        
        const ttl = await this.redis.ttl(notificationKey)
        await this.redis.setex(notificationKey, ttl > 0 ? ttl : 86400, JSON.stringify(notification))
      }
    } catch (error) {
      console.error('Redis mark as read error:', error)
      throw error
    }
  }
  
  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId)
      return notifications.filter(n => !n.read).length
    } catch (error) {
      console.error('Redis unread count error:', error)
      return 0
    }
  }
}

// Analytics and metrics
export class RedisAnalytics {
  private redis: Redis
  private metricsPrefix = 'metrics:'
  private dailyPrefix = 'daily:'
  
  constructor() {
    this.redis = getRedisClient()
  }
  
  // Track user activity
  async trackActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const activityKey = `${this.metricsPrefix}activity:${userId}:${today}`
      const globalActivityKey = `${this.metricsPrefix}global:${activity}:${today}`
      
      // Increment user activity counter
      await this.redis.hincrby(activityKey, activity, 1)
      await this.redis.expire(activityKey, 86400 * 30) // 30 days
      
      // Increment global activity counter
      await this.redis.incr(globalActivityKey)
      await this.redis.expire(globalActivityKey, 86400 * 30)
      
      // Store activity details if metadata provided
      if (metadata) {
        const detailKey = `${this.metricsPrefix}details:${userId}:${activity}:${Date.now()}`
        await this.redis.setex(detailKey, 86400 * 7, JSON.stringify(metadata)) // 7 days
      }
    } catch (error) {
      console.error('Redis track activity error:', error)
    }
  }
  
  // Get user activity stats
  async getUserActivityStats(userId: string, days: number = 7): Promise<any> {
    try {
      const stats: any = {}
      const pipeline = this.redis.pipeline()
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const activityKey = `${this.metricsPrefix}activity:${userId}:${dateStr}`
        pipeline.hgetall(activityKey)
      }
      
      const results = await pipeline.exec()
      
      results?.forEach((result, index) => {
        const date = new Date()
        date.setDate(date.getDate() - index)
        const dateStr = date.toISOString().split('T')[0]
        stats[dateStr] = result?.[1] || {}
      })
      
      return stats
    } catch (error) {
      console.error('Redis get user stats error:', error)
      return {}
    }
  }
  
  // Get global metrics
  async getGlobalMetrics(activity: string, days: number = 30): Promise<number[]> {
    try {
      const metrics: number[] = []
      const pipeline = this.redis.pipeline()
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const metricKey = `${this.metricsPrefix}global:${activity}:${dateStr}`
        pipeline.get(metricKey)
      }
      
      const results = await pipeline.exec()
      
      results?.forEach((result) => {
        metrics.push(parseInt(result?.[1] as string) || 0)
      })
      
      return metrics.reverse() // Return in chronological order
    } catch (error) {
      console.error('Redis get global metrics error:', error)
      return []
    }
  }
}

// Real-time features
export class RedisRealTime {
  private redis: Redis
  private subscriber: Redis
  private publisher: Redis
  
  constructor() {
    this.redis = getRedisClient()
    this.subscriber = new Redis(redisConfig)
    this.publisher = new Redis(redisConfig)
  }
  
  // Subscribe to user events
  async subscribeToUserEvents(userId: string, callback: (message: any) => void): Promise<void> {
    try {
      await this.subscriber.subscribe(`user:${userId}:notifications`)
      await this.subscriber.subscribe(`user:${userId}:updates`)
      
      this.subscriber.on('message', (channel, message) => {
        try {
          const data = JSON.parse(message)
          callback({ channel, data })
        } catch (error) {
          console.error('Redis message parse error:', error)
        }
      })
    } catch (error) {
      console.error('Redis subscribe error:', error)
      throw error
    }
  }
  
  // Publish user event
  async publishUserEvent(userId: string, event: string, data: any): Promise<void> {
    try {
      const channel = `user:${userId}:${event}`
      await this.publisher.publish(channel, JSON.stringify(data))
    } catch (error) {
      console.error('Redis publish error:', error)
      throw error
    }
  }
  
  // Broadcast system event
  async broadcastSystemEvent(event: string, data: any): Promise<void> {
    try {
      await this.publisher.publish(`system:${event}`, JSON.stringify(data))
    } catch (error) {
      console.error('Redis broadcast error:', error)
      throw error
    }
  }
  
  // Set user online status
  async setUserOnline(userId: string): Promise<void> {
    try {
      const onlineKey = 'users:online'
      await this.redis.sadd(onlineKey, userId)
      await this.redis.setex(`user:${userId}:last_seen`, 300, new Date().toISOString()) // 5 min TTL
    } catch (error) {
      console.error('Redis set online error:', error)
    }
  }
  
  // Set user offline
  async setUserOffline(userId: string): Promise<void> {
    try {
      const onlineKey = 'users:online'
      await this.redis.srem(onlineKey, userId)
      await this.redis.del(`user:${userId}:last_seen`)
    } catch (error) {
      console.error('Redis set offline error:', error)
    }
  }
  
  // Get online users
  async getOnlineUsers(): Promise<string[]> {
    try {
      return await this.redis.smembers('users:online')
    } catch (error) {
      console.error('Redis get online users error:', error)
      return []
    }
  }
}

// Rate limiting
export class RedisRateLimit {
  private redis: Redis
  private rateLimitPrefix = 'rate_limit:'
  
  constructor() {
    this.redis = getRedisClient()
  }
  
  // Check rate limit
  async checkRateLimit(
    identifier: string, 
    windowMs: number, 
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const key = `${this.rateLimitPrefix}${identifier}`
      const window = Math.floor(Date.now() / windowMs)
      const windowKey = `${key}:${window}`
      
      const current = await this.redis.incr(windowKey)
      
      if (current === 1) {
        await this.redis.expire(windowKey, Math.ceil(windowMs / 1000))
      }
      
      const allowed = current <= maxRequests
      const remaining = Math.max(0, maxRequests - current)
      const resetTime = (window + 1) * windowMs
      
      return { allowed, remaining, resetTime }
    } catch (error) {
      console.error('Redis rate limit error:', error)
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs }
    }
  }
  
  // Reset rate limit
  async resetRateLimit(identifier: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.rateLimitPrefix}${identifier}:*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Redis reset rate limit error:', error)
    }
  }
}

// Export singleton instances
export const redisCache = new RedisCache()
export const redisSession = new RedisSessionManager()
export const redisAnalytics = new RedisAnalytics()
export const redisRealTime = new RedisRealTime()
export const redisRateLimit = new RedisRateLimit()

// Utility functions
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userPermissions: (id: string) => `user:${id}:permissions`,
  userSessions: (id: string) => `user:${id}:sessions`,
  simInventory: (warehouseId: string) => `sims:warehouse:${warehouseId}`,
  customerData: (id: string) => `customer:${id}`,
  transactionHistory: (userId: string) => `transactions:${userId}`,
  systemStats: () => 'system:stats',
  webhookLogs: (endpoint: string) => `webhooks:${endpoint}:logs`,
  reportCache: (type: string, params: string) => `reports:${type}:${params}`,
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const redis = getRedisClient()
    await redis.ping()
    return true
  } catch (error) {
    console.error('Redis health check failed:', error)
    return false
  }
}

// Graceful shutdown
export async function closeRedisConnections(): Promise<void> {
  try {
    if (redis) {
      await redis.quit()
      redis = null
    }
  } catch (error) {
    console.error('Redis close error:', error)
  }
}