import { redisCache, redisAnalytics, cacheKeys } from './redis'
import { DatabaseFactory } from './mongodb'

export class CacheService {
  private static cacheService: any = null
  
  private static async getCacheService(): Promise<any> {
    if (!this.cacheService) {
      this.cacheService = await DatabaseFactory.getCacheService()
    }
    return this.cacheService
  }

  // Cache user data
  static async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      await cacheService.set(cacheKeys.user(userId), userData, ttl)
      
      // Track activity using the analytics service
      const analyticsService = await DatabaseFactory.getAnalyticsService()
      await analyticsService.trackActivity(userId, 'cache_user_data')
    } catch (error) {
      console.error('Cache user error:', error)
    }
  }

  // Get cached user
  static async getCachedUser(userId: string): Promise<any | null> {
    try {
      const cacheService = await this.getCacheService()
      return await cacheService.get(cacheKeys.user(userId))
    } catch (error) {
      console.error('Get cached user error:', error)
      return null
    }
  }

  // Cache SIM inventory
  static async cacheSIMInventory(warehouseId: string, inventory: any[], ttl: number = 1800): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      await cacheService.set(cacheKeys.simInventory(warehouseId), inventory, ttl)
    } catch (error) {
      console.error('Cache SIM inventory error:', error)
    }
  }

  // Get cached SIM inventory
  static async getCachedSIMInventory(warehouseId: string): Promise<any[] | null> {
    try {
      const cacheService = await this.getCacheService()
      return await cacheService.get(cacheKeys.simInventory(warehouseId))
    } catch (error) {
      console.error('Get cached SIM inventory error:', error)
      return null
    }
  }

  // Cache customer data
  static async cacheCustomer(customerId: string, customerData: any, ttl: number = 1800): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      await cacheService.set(cacheKeys.customerData(customerId), customerData, ttl)
    } catch (error) {
      console.error('Cache customer error:', error)
    }
  }

  // Get cached customer
  static async getCachedCustomer(customerId: string): Promise<any | null> {
    try {
      const cacheService = await this.getCacheService()
      return await cacheService.get(cacheKeys.customerData(customerId))
    } catch (error) {
      console.error('Get cached customer error:', error)
      return null
    }
  }

  // Cache transaction history
  static async cacheTransactionHistory(userId: string, transactions: any[], ttl: number = 900): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      await cacheService.set(cacheKeys.transactionHistory(userId), transactions, ttl)
    } catch (error) {
      console.error('Cache transaction history error:', error)
    }
  }

  // Get cached transaction history
  static async getCachedTransactionHistory(userId: string): Promise<any[] | null> {
    try {
      const cacheService = await this.getCacheService()
      return await cacheService.get(cacheKeys.transactionHistory(userId))
    } catch (error) {
      console.error('Get cached transaction history error:', error)
      return null
    }
  }

  // Cache system statistics
  static async cacheSystemStats(stats: any, ttl: number = 300): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      await cacheService.set(cacheKeys.systemStats(), stats, ttl)
    } catch (error) {
      console.error('Cache system stats error:', error)
    }
  }

  // Get cached system stats
  static async getCachedSystemStats(): Promise<any | null> {
    try {
      const cacheService = await this.getCacheService()
      return await cacheService.get(cacheKeys.systemStats())
    } catch (error) {
      console.error('Get cached system stats error:', error)
      return null
    }
  }

  // Cache report data
  static async cacheReport(reportType: string, params: any, reportData: any, ttl: number = 1800): Promise<void> {
    try {
      const paramsHash = Buffer.from(JSON.stringify(params)).toString('base64')
      const cacheService = await this.getCacheService()
      await cacheService.set(cacheKeys.reportCache(reportType, paramsHash), reportData, ttl)
    } catch (error) {
      console.error('Cache report error:', error)
    }
  }

  // Get cached report
  static async getCachedReport(reportType: string, params: any): Promise<any | null> {
    try {
      const paramsHash = Buffer.from(JSON.stringify(params)).toString('base64')
      const cacheService = await this.getCacheService()
      return await cacheService.get(cacheKeys.reportCache(reportType, paramsHash))
    } catch (error) {
      console.error('Get cached report error:', error)
      return null
    }
  }

  // Invalidate user cache
  static async invalidateUserCache(userId: string): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      await cacheService.del(cacheKeys.user(userId))
      await cacheService.del(cacheKeys.userPermissions(userId))
      await cacheService.del(cacheKeys.transactionHistory(userId))
    } catch (error) {
      console.error('Invalidate user cache error:', error)
    }
  }

  // Invalidate all cache
  static async invalidateAllCache(): Promise<void> {
    try {
      const cacheService = await this.getCacheService()
      if (cacheService.flushAll) {
        await cacheService.flushAll()
      } else {
        // For MongoDB fallback, we'd need to clear the cache collection
        console.warn('Full cache invalidation not supported with MongoDB fallback')
      }
    } catch (error) {
      console.error('Invalidate all cache error:', error)
    }
  }

  // Get cache statistics
  static async getCacheStats(): Promise<any> {
    try {
      const dbType = await DatabaseFactory.getPreferredDatabase()
      
      if (dbType === 'redis' || dbType === 'both') {
        try {
          const { redisCache } = await import('./redis')
          const redis = redisCache['redis']
          const info = await redis.info('memory')
          const keyspace = await redis.info('keyspace')
          
          return {
            type: 'redis',
            memory: info,
            keyspace: keyspace,
            timestamp: new Date().toISOString()
          }
        } catch (error) {
          console.warn('Redis stats not available, using MongoDB stats')
        }
      }
      
      // MongoDB cache stats
      const { getMongoDb } = await import('./mongodb')
      const db = await getMongoDb()
      const cacheCollection = db.collection('cache')
      const totalDocs = await cacheCollection.countDocuments()
      const stats = await db.stats()
      
      return {
        type: 'mongodb',
        totalCacheEntries: totalDocs,
        dbStats: stats,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Get cache stats error:', error)
      return null
    }
  }
}