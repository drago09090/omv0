import { DatabaseFactory } from './mongodb'
import { mongoService, mongoAnalytics, mongoNotifications } from './mongodb'

// Unified database service that works with both Redis and MongoDB
export class UnifiedDatabaseService {
  private static instance: UnifiedDatabaseService
  private cacheService: any = null
  private analyticsService: any = null
  private sessionService: any = null
  
  private constructor() {
    this.initializeServices()
  }
  
  static getInstance(): UnifiedDatabaseService {
    if (!UnifiedDatabaseService.instance) {
      UnifiedDatabaseService.instance = new UnifiedDatabaseService()
    }
    return UnifiedDatabaseService.instance
  }
  
  private async initializeServices(): Promise<void> {
    try {
      this.cacheService = await DatabaseFactory.getCacheService()
      this.analyticsService = await DatabaseFactory.getAnalyticsService()
      this.sessionService = await DatabaseFactory.getSessionService()
    } catch (error) {
      console.error('Database service initialization error:', error)
    }
  }
  
  // Cache operations (Redis or MongoDB fallback)
  async setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      if (!this.cacheService) {
        this.cacheService = await DatabaseFactory.getCacheService()
      }
      await this.cacheService.set(key, value, ttl)
    } catch (error) {
      console.error('Set cache error:', error)
    }
  }
  
  async getCache<T>(key: string): Promise<T | null> {
    try {
      if (!this.cacheService) {
        this.cacheService = await DatabaseFactory.getCacheService()
      }
      return await this.cacheService.get(key)
    } catch (error) {
      console.error('Get cache error:', error)
      return null
    }
  }
  
  async deleteCache(key: string): Promise<void> {
    try {
      if (!this.cacheService) {
        this.cacheService = await DatabaseFactory.getCacheService()
      }
      await this.cacheService.del(key)
    } catch (error) {
      console.error('Delete cache error:', error)
    }
  }
  
  // User operations (MongoDB primary)
  async createUser(userData: any): Promise<any> {
    try {
      const user = await mongoService.createUser(userData)
      
      // Cache user data
      await this.setCache(`user:${user._id}`, user, 3600)
      
      // Track activity
      await this.trackActivity(user._id, 'user_created')
      
      return user
    } catch (error) {
      console.error('Create user error:', error)
      throw error
    }
  }
  
  async getUser(userId: string): Promise<any | null> {
    try {
      // Try cache first
      const cachedUser = await this.getCache(`user:${userId}`)
      if (cachedUser) {
        return cachedUser
      }
      
      // Fetch from MongoDB
      const user = await mongoService.getUserById(userId)
      if (user) {
        // Cache for future requests
        await this.setCache(`user:${userId}`, user, 3600)
      }
      
      return user
    } catch (error) {
      console.error('Get user error:', error)
      return null
    }
  }
  
  async updateUser(userId: string, updateData: any): Promise<boolean> {
    try {
      const success = await mongoService.updateUser(userId, updateData)
      if (success) {
        // Invalidate cache
        await this.deleteCache(`user:${userId}`)
        
        // Track activity
        await this.trackActivity(userId, 'user_updated')
      }
      return success
    } catch (error) {
      console.error('Update user error:', error)
      return false
    }
  }
  
  // Customer operations
  async createCustomer(customerData: any): Promise<any> {
    try {
      const customer = await mongoService.createCustomer(customerData)
      
      // Cache customer data
      await this.setCache(`customer:${customer._id}`, customer, 1800)
      
      // Track activity
      await this.trackActivity(customerData.createdBy, 'customer_created', {
        customerId: customer._id,
        customerName: customer.name
      })
      
      return customer
    } catch (error) {
      console.error('Create customer error:', error)
      throw error
    }
  }
  
  async getCustomers(filter: any = {}, useCache: boolean = true): Promise<any[]> {
    try {
      const cacheKey = `customers:${JSON.stringify(filter)}`
      
      if (useCache) {
        const cachedCustomers = await this.getCache(cacheKey)
        if (cachedCustomers) {
          return cachedCustomers
        }
      }
      
      const customers = await mongoService.getCustomers(filter)
      
      if (useCache) {
        await this.setCache(cacheKey, customers, 1800)
      }
      
      return customers
    } catch (error) {
      console.error('Get customers error:', error)
      return []
    }
  }
  
  // SIM operations
  async createSim(simData: any): Promise<any> {
    try {
      const sim = await mongoService.createSim(simData)
      
      // Invalidate SIM cache
      await this.deleteCache('sims:all')
      await this.deleteCache(`sims:warehouse:${simData.warehouseId}`)
      
      // Track activity
      await this.trackActivity(simData.createdBy, 'sim_created', {
        simId: sim._id,
        iccid: sim.iccid
      })
      
      return sim
    } catch (error) {
      console.error('Create SIM error:', error)
      throw error
    }
  }
  
  async getSims(filter: any = {}, useCache: boolean = true): Promise<any[]> {
    try {
      const cacheKey = `sims:${JSON.stringify(filter)}`
      
      if (useCache) {
        const cachedSims = await this.getCache(cacheKey)
        if (cachedSims) {
          return cachedSims
        }
      }
      
      const sims = await mongoService.getSims(filter)
      
      if (useCache) {
        await this.setCache(cacheKey, sims, 1800)
      }
      
      return sims
    } catch (error) {
      console.error('Get SIMs error:', error)
      return []
    }
  }
  
  // Transaction operations
  async createTransaction(transactionData: any): Promise<any> {
    try {
      const transaction = await mongoService.createTransaction(transactionData)
      
      // Invalidate related caches
      await this.deleteCache(`transactions:user:${transactionData.operatorId}`)
      await this.deleteCache(`transactions:customer:${transactionData.customerId}`)
      
      // Track activity
      await this.trackActivity(transactionData.operatorId, 'transaction_created', {
        transactionId: transaction._id,
        type: transaction.type,
        amount: transaction.amount
      })
      
      return transaction
    } catch (error) {
      console.error('Create transaction error:', error)
      throw error
    }
  }
  
  async getTransactions(filter: any = {}, useCache: boolean = true): Promise<any[]> {
    try {
      const cacheKey = `transactions:${JSON.stringify(filter)}`
      
      if (useCache) {
        const cachedTransactions = await this.getCache(cacheKey)
        if (cachedTransactions) {
          return cachedTransactions
        }
      }
      
      const transactions = await mongoService.getTransactions(filter)
      
      if (useCache) {
        await this.setCache(cacheKey, transactions, 900) // 15 minutes
      }
      
      return transactions
    } catch (error) {
      console.error('Get transactions error:', error)
      return []
    }
  }
  
  // Ticket operations
  async createTicket(ticketData: any): Promise<any> {
    try {
      const ticket = await mongoService.createTicket(ticketData)
      
      // Invalidate tickets cache
      await this.deleteCache('tickets:all')
      await this.deleteCache(`tickets:user:${ticketData.createdBy}`)
      
      // Track activity
      await this.trackActivity(ticketData.createdBy, 'ticket_created', {
        ticketId: ticket._id,
        category: ticket.category,
        priority: ticket.priority
      })
      
      // Send notification to assigned user
      if (ticketData.assignedTo) {
        await mongoNotifications.sendNotification(ticketData.assignedTo, {
          title: 'Nuevo ticket asignado',
          message: `Se te ha asignado el ticket: ${ticket.title}`,
          type: 'info',
          metadata: { ticketId: ticket._id }
        })
      }
      
      return ticket
    } catch (error) {
      console.error('Create ticket error:', error)
      throw error
    }
  }
  
  async getTickets(filter: any = {}, useCache: boolean = true): Promise<any[]> {
    try {
      const cacheKey = `tickets:${JSON.stringify(filter)}`
      
      if (useCache) {
        const cachedTickets = await this.getCache(cacheKey)
        if (cachedTickets) {
          return cachedTickets
        }
      }
      
      const tickets = await mongoService.getTickets(filter)
      
      if (useCache) {
        await this.setCache(cacheKey, tickets, 1800)
      }
      
      return tickets
    } catch (error) {
      console.error('Get tickets error:', error)
      return []
    }
  }
  
  async updateTicket(ticketId: string, updateData: any): Promise<boolean> {
    try {
      const success = await mongoService.updateTicket(ticketId, updateData)
      if (success) {
        // Invalidate related caches
        await this.deleteCache('tickets:all')
        await this.deleteCache(`ticket:${ticketId}`)
        
        // Track activity if status changed
        if (updateData.status) {
          await this.trackActivity(updateData.updatedBy || 'system', 'ticket_status_changed', {
            ticketId,
            newStatus: updateData.status
          })
        }
      }
      return success
    } catch (error) {
      console.error('Update ticket error:', error)
      return false
    }
  }
  
  // Analytics operations
  async trackActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    try {
      if (!this.analyticsService) {
        this.analyticsService = await DatabaseFactory.getAnalyticsService()
      }
      await this.analyticsService.trackActivity(userId, activity, metadata)
    } catch (error) {
      console.error('Track activity error:', error)
    }
  }
  
  // System metrics
  async getSystemMetrics(): Promise<any> {
    try {
      const cacheKey = 'system:metrics'
      const cachedMetrics = await this.getCache(cacheKey)
      
      if (cachedMetrics) {
        return cachedMetrics
      }
      
      // Generate fresh metrics from MongoDB
      const [
        totalUsers,
        totalCustomers,
        totalSims,
        activeSims,
        todayTransactions
      ] = await Promise.all([
        mongoService.findMany('users', { isActive: true }),
        mongoService.findMany('customers', { status: 'active' }),
        mongoService.findMany('sims'),
        mongoService.findMany('sims', { status: 'active' }),
        mongoService.findMany('transactions', { 
          createdAt: { 
            $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
          } 
        })
      ])
      
      const metrics = {
        totalUsers: totalUsers.length,
        totalCustomers: totalCustomers.length,
        totalSims: totalSims.length,
        activeSims: activeSims.length,
        todayTransactions: todayTransactions.length,
        totalRevenue: todayTransactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0),
        timestamp: new Date().toISOString()
      }
      
      // Cache for 5 minutes
      await this.setCache(cacheKey, metrics, 300)
      
      return metrics
    } catch (error) {
      console.error('Get system metrics error:', error)
      return {
        totalUsers: 0,
        totalCustomers: 0,
        totalSims: 0,
        activeSims: 0,
        todayTransactions: 0,
        totalRevenue: 0,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// Export singleton instance
export const unifiedDb = UnifiedDatabaseService.getInstance()