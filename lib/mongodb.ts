import { MongoClient, Db, Collection } from 'mongodb'
import mongoose from 'mongoose'

// MongoDB configuration
const mongoConfig = {
  uri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://ahmsani786:azm009090@cluster0.coki01o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  dbName: process.env.MONGODB_DB_NAME || process.env.MONGO_DB_NAME || 'omv_database',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
    retryWrites: true,
    retryReads: true,
    ssl: true,
    authSource: 'admin'
  }
}

// MongoDB client instance
let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

// Mongoose connection
let mongooseConnection: typeof mongoose | null = null

export async function getMongoClient(): Promise<MongoClient> {
  if (!mongoClient) {
    try {
      mongoClient = new MongoClient(mongoConfig.uri, mongoConfig.options)
      await mongoClient.connect()
      console.log('✅ MongoDB client connected successfully')
    } catch (error) {
      console.error('❌ MongoDB client connection error:', error)
      throw error
    }
  }
  
  return mongoClient
}

export async function getMongoDb(): Promise<Db> {
  if (!mongoDb) {
    const client = await getMongoClient()
    mongoDb = client.db(mongoConfig.dbName)
    console.log('🚀 MongoDB database ready:', mongoConfig.dbName)
  }
  
  return mongoDb
}

export async function getMongooseConnection(): Promise<typeof mongoose> {
  if (!mongooseConnection) {
    try {
      mongooseConnection = await mongoose.connect(mongoConfig.uri, {
        dbName: mongoConfig.dbName,
        ...mongoConfig.options
      })
      
      mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected successfully')
      })
      
      mongoose.connection.on('error', (error) => {
        console.error('❌ Mongoose connection error:', error)
      })
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ Mongoose disconnected')
      })
      
      console.log('🚀 Mongoose connection established')
    } catch (error) {
      console.error('❌ Mongoose connection error:', error)
      throw error
    }
  }
  
  return mongooseConnection
}

// MongoDB utilities
export class MongoDBService {
  private db: Db | null = null
  
  constructor() {
    this.initializeDb()
  }
  
  private async initializeDb(): Promise<void> {
    try {
      this.db = await getMongoDb()
    } catch (error) {
      console.error('MongoDB service initialization error:', error)
    }
  }
  
  async getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
    if (!this.db) {
      this.db = await getMongoDb()
    }
    return this.db.collection<T>(collectionName)
  }
  
  // User operations
  async createUser(userData: any): Promise<any> {
    try {
      const users = await this.getCollection('users')
      const result = await users.insertOne({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { ...userData, _id: result.insertedId }
    } catch (error) {
      console.error('MongoDB create user error:', error)
      throw error
    }
  }
  
  async getUserById(userId: string): Promise<any | null> {
    try {
      const users = await this.getCollection('users')
      return await users.findOne({ _id: userId })
    } catch (error) {
      console.error('MongoDB get user error:', error)
      return null
    }
  }
  
  async updateUser(userId: string, updateData: any): Promise<boolean> {
    try {
      const users = await this.getCollection('users')
      const result = await users.updateOne(
        { _id: userId },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('MongoDB update user error:', error)
      return false
    }
  }
  
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const users = await this.getCollection('users')
      const result = await users.deleteOne({ _id: userId })
      return result.deletedCount > 0
    } catch (error) {
      console.error('MongoDB delete user error:', error)
      return false
    }
  }
  
  async getUsers(filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const users = await this.getCollection('users')
      const cursor = users.find(filter, options)
      return await cursor.toArray()
    } catch (error) {
      console.error('MongoDB get users error:', error)
      return []
    }
  }
  
  // Customer operations
  async createCustomer(customerData: any): Promise<any> {
    try {
      const customers = await this.getCollection('customers')
      const result = await customers.insertOne({
        ...customerData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { ...customerData, _id: result.insertedId }
    } catch (error) {
      console.error('MongoDB create customer error:', error)
      throw error
    }
  }
  
  async getCustomers(filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const customers = await this.getCollection('customers')
      const cursor = customers.find(filter, options)
      return await cursor.toArray()
    } catch (error) {
      console.error('MongoDB get customers error:', error)
      return []
    }
  }
  
  async updateCustomer(customerId: string, updateData: any): Promise<boolean> {
    try {
      const customers = await this.getCollection('customers')
      const result = await customers.updateOne(
        { _id: customerId },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('MongoDB update customer error:', error)
      return false
    }
  }
  
  // SIM operations
  async createSim(simData: any): Promise<any> {
    try {
      const sims = await this.getCollection('sims')
      const result = await sims.insertOne({
        ...simData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { ...simData, _id: result.insertedId }
    } catch (error) {
      console.error('MongoDB create SIM error:', error)
      throw error
    }
  }
  
  async getSims(filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const sims = await this.getCollection('sims')
      const cursor = sims.find(filter, options)
      return await cursor.toArray()
    } catch (error) {
      console.error('MongoDB get SIMs error:', error)
      return []
    }
  }
  
  async updateSim(simId: string, updateData: any): Promise<boolean> {
    try {
      const sims = await this.getCollection('sims')
      const result = await sims.updateOne(
        { _id: simId },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('MongoDB update SIM error:', error)
      return false
    }
  }
  
  // Transaction operations
  async createTransaction(transactionData: any): Promise<any> {
    try {
      const transactions = await this.getCollection('transactions')
      const result = await transactions.insertOne({
        ...transactionData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { ...transactionData, _id: result.insertedId }
    } catch (error) {
      console.error('MongoDB create transaction error:', error)
      throw error
    }
  }
  
  async getTransactions(filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const transactions = await this.getCollection('transactions')
      const cursor = transactions.find(filter, options)
      return await cursor.toArray()
    } catch (error) {
      console.error('MongoDB get transactions error:', error)
      return []
    }
  }
  
  // Ticket operations
  async createTicket(ticketData: any): Promise<any> {
    try {
      const tickets = await this.getCollection('tickets')
      const result = await tickets.insertOne({
        ...ticketData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { ...ticketData, _id: result.insertedId }
    } catch (error) {
      console.error('MongoDB create ticket error:', error)
      throw error
    }
  }
  
  async getTickets(filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const tickets = await this.getCollection('tickets')
      const cursor = tickets.find(filter, options)
      return await cursor.toArray()
    } catch (error) {
      console.error('MongoDB get tickets error:', error)
      return []
    }
  }
  
  async updateTicket(ticketId: string, updateData: any): Promise<boolean> {
    try {
      const tickets = await this.getCollection('tickets')
      const result = await tickets.updateOne(
        { _id: ticketId },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('MongoDB update ticket error:', error)
      return false
    }
  }
  
  // Analytics operations
  async trackActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    try {
      const analytics = await this.getCollection('analytics')
      await analytics.insertOne({
        userId,
        activity,
        metadata: metadata || {},
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('MongoDB track activity error:', error)
    }
  }
  
  async getActivityStats(userId: string, days: number = 7): Promise<any> {
    try {
      const analytics = await this.getCollection('analytics')
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const pipeline = [
        {
          $match: {
            userId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: '$date',
              activity: '$activity'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            activities: {
              $push: {
                activity: '$_id.activity',
                count: '$count'
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]
      
      const results = await analytics.aggregate(pipeline).toArray()
      
      const stats: any = {}
      results.forEach(result => {
        stats[result._id] = {}
        result.activities.forEach((activity: any) => {
          stats[result._id][activity.activity] = activity.count
        })
      })
      
      return stats
    } catch (error) {
      console.error('MongoDB get activity stats error:', error)
      return {}
    }
  }
  
  // Warehouse operations
  async getWarehouseInventory(warehouseId: string): Promise<any[]> {
    try {
      const inventory = await this.getCollection('warehouse_inventory')
      return await inventory.find({ warehouseId }).toArray()
    } catch (error) {
      console.error('MongoDB get warehouse inventory error:', error)
      return []
    }
  }
  
  async updateWarehouseInventory(warehouseId: string, inventoryData: any): Promise<boolean> {
    try {
      const inventory = await this.getCollection('warehouse_inventory')
      const result = await inventory.updateOne(
        { warehouseId },
        { 
          $set: { 
            ...inventoryData, 
            updatedAt: new Date() 
          } 
        },
        { upsert: true }
      )
      return result.modifiedCount > 0 || result.upsertedCount > 0
    } catch (error) {
      console.error('MongoDB update warehouse inventory error:', error)
      return false
    }
  }
  
  // Generic operations
  async findOne<T>(collectionName: string, filter: any): Promise<T | null> {
    try {
      const collection = await this.getCollection<T>(collectionName)
      return await collection.findOne(filter)
    } catch (error) {
      console.error(`MongoDB findOne error in ${collectionName}:`, error)
      return null
    }
  }
  
  async findMany<T>(collectionName: string, filter: any = {}, options: any = {}): Promise<T[]> {
    try {
      const collection = await this.getCollection<T>(collectionName)
      const cursor = collection.find(filter, options)
      return await cursor.toArray()
    } catch (error) {
      console.error(`MongoDB findMany error in ${collectionName}:`, error)
      return []
    }
  }
  
  async insertOne<T>(collectionName: string, document: any): Promise<T | null> {
    try {
      const collection = await this.getCollection<T>(collectionName)
      const result = await collection.insertOne({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return { ...document, _id: result.insertedId } as T
    } catch (error) {
      console.error(`MongoDB insertOne error in ${collectionName}:`, error)
      return null
    }
  }
  
  async updateOne(collectionName: string, filter: any, updateData: any): Promise<boolean> {
    try {
      const collection = await this.getCollection(collectionName)
      const result = await collection.updateOne(
        filter,
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error(`MongoDB updateOne error in ${collectionName}:`, error)
      return false
    }
  }
  
  async deleteOne(collectionName: string, filter: any): Promise<boolean> {
    try {
      const collection = await this.getCollection(collectionName)
      const result = await collection.deleteOne(filter)
      return result.deletedCount > 0
    } catch (error) {
      console.error(`MongoDB deleteOne error in ${collectionName}:`, error)
      return false
    }
  }
  
  async aggregate<T>(collectionName: string, pipeline: any[]): Promise<T[]> {
    try {
      const collection = await this.getCollection<T>(collectionName)
      return await collection.aggregate(pipeline).toArray()
    } catch (error) {
      console.error(`MongoDB aggregate error in ${collectionName}:`, error)
      return []
    }
  }
}

// Session management with MongoDB
export class MongoSessionManager {
  private collection: Collection | null = null
  
  constructor() {
    this.initializeCollection()
  }
  
  private async initializeCollection(): Promise<void> {
    try {
      const db = await getMongoDb()
      this.collection = db.collection('user_sessions')
      
      // Create indexes for better performance
      await this.collection.createIndex({ userId: 1 })
      await this.collection.createIndex({ sessionId: 1 }, { unique: true })
      await this.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    } catch (error) {
      console.error('MongoDB session manager initialization error:', error)
    }
  }
  
  async createSession(userId: string, sessionData: any, ttlSeconds: number = 28800): Promise<string> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000)
      
      await this.collection!.insertOne({
        sessionId,
        userId,
        ...sessionData,
        createdAt: new Date(),
        expiresAt
      })
      
      return sessionId
    } catch (error) {
      console.error('MongoDB create session error:', error)
      throw error
    }
  }
  
  async getSession(sessionId: string): Promise<any | null> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      return await this.collection!.findOne({ sessionId })
    } catch (error) {
      console.error('MongoDB get session error:', error)
      return null
    }
  }
  
  async updateSession(sessionId: string, updateData: any): Promise<boolean> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const result = await this.collection!.updateOne(
        { sessionId },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('MongoDB update session error:', error)
      return false
    }
  }
  
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const result = await this.collection!.deleteOne({ sessionId })
      return result.deletedCount > 0
    } catch (error) {
      console.error('MongoDB delete session error:', error)
      return false
    }
  }
  
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      return await this.collection!.find({ userId }).toArray()
    } catch (error) {
      console.error('MongoDB get user sessions error:', error)
      return []
    }
  }
  
  async deleteAllUserSessions(userId: string): Promise<boolean> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const result = await this.collection!.deleteMany({ userId })
      return result.deletedCount > 0
    } catch (error) {
      console.error('MongoDB delete all user sessions error:', error)
      return false
    }
  }
}

// Analytics with MongoDB
export class MongoAnalytics {
  private collection: Collection | null = null
  
  constructor() {
    this.initializeCollection()
  }
  
  private async initializeCollection(): Promise<void> {
    try {
      const db = await getMongoDb()
      this.collection = db.collection('analytics')
      
      // Create indexes
      await this.collection.createIndex({ userId: 1, date: 1 })
      await this.collection.createIndex({ activity: 1, date: 1 })
      await this.collection.createIndex({ timestamp: 1 })
    } catch (error) {
      console.error('MongoDB analytics initialization error:', error)
    }
  }
  
  async trackActivity(userId: string, activity: string, metadata?: any): Promise<void> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      await this.collection!.insertOne({
        userId,
        activity,
        metadata: metadata || {},
        timestamp: new Date(),
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('MongoDB track activity error:', error)
    }
  }
  
  async getUserActivityStats(userId: string, days: number = 7): Promise<any> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const pipeline = [
        {
          $match: {
            userId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              date: '$date',
              activity: '$activity'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            activities: {
              $push: {
                activity: '$_id.activity',
                count: '$count'
              }
            }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]
      
      const results = await this.collection!.aggregate(pipeline).toArray()
      
      const stats: any = {}
      results.forEach(result => {
        stats[result._id] = {}
        result.activities.forEach((activity: any) => {
          stats[result._id][activity.activity] = activity.count
        })
      })
      
      return stats
    } catch (error) {
      console.error('MongoDB get user activity stats error:', error)
      return {}
    }
  }
  
  async getGlobalMetrics(activity: string, days: number = 30): Promise<number[]> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      const pipeline = [
        {
          $match: {
            activity,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]
      
      const results = await this.collection!.aggregate(pipeline).toArray()
      
      // Fill in missing dates with 0
      const metrics: number[] = []
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const result = results.find(r => r._id === dateStr)
        metrics.push(result ? result.count : 0)
      }
      
      return metrics
    } catch (error) {
      console.error('MongoDB get global metrics error:', error)
      return []
    }
  }
}

// Notification system with MongoDB
export class MongoNotificationManager {
  private collection: Collection | null = null
  
  constructor() {
    this.initializeCollection()
  }
  
  private async initializeCollection(): Promise<void> {
    try {
      const db = await getMongoDb()
      this.collection = db.collection('notifications')
      
      // Create indexes
      await this.collection.createIndex({ userId: 1, createdAt: -1 })
      await this.collection.createIndex({ read: 1 })
      await this.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 604800 }) // 7 days
    } catch (error) {
      console.error('MongoDB notification manager initialization error:', error)
    }
  }
  
  async sendNotification(userId: string, notification: any): Promise<void> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const notificationData = {
        userId,
        ...notification,
        read: false,
        createdAt: new Date()
      }
      
      await this.collection!.insertOne(notificationData)
    } catch (error) {
      console.error('MongoDB send notification error:', error)
    }
  }
  
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      return await this.collection!
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('MongoDB get user notifications error:', error)
      return []
    }
  }
  
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      const result = await this.collection!.updateOne(
        { _id: notificationId },
        { 
          $set: { 
            read: true, 
            readAt: new Date() 
          } 
        }
      )
      return result.modifiedCount > 0
    } catch (error) {
      console.error('MongoDB mark as read error:', error)
      return false
    }
  }
  
  async getUnreadCount(userId: string): Promise<number> {
    try {
      if (!this.collection) {
        await this.initializeCollection()
      }
      
      return await this.collection!.countDocuments({ userId, read: false })
    } catch (error) {
      console.error('MongoDB get unread count error:', error)
      return 0
    }
  }
}

// Export singleton instances
export const mongoService = new MongoDBService()
export const mongoSession = new MongoSessionManager()
export const mongoAnalytics = new MongoAnalytics()
export const mongoNotifications = new MongoNotificationManager()

// Utility functions for MongoDB
export const mongoCollections = {
  users: 'users',
  customers: 'customers',
  sims: 'sims',
  transactions: 'transactions',
  tickets: 'tickets',
  analytics: 'analytics',
  notifications: 'notifications',
  warehouse_inventory: 'warehouse_inventory',
  user_sessions: 'user_sessions',
  webhook_logs: 'webhook_logs',
  system_settings: 'system_settings'
}

// Health check for MongoDB
export async function checkMongoHealth(): Promise<boolean> {
  try {
    const client = await getMongoClient()
    await client.db('admin').command({ ping: 1 })
    return true
  } catch (error) {
    console.error('MongoDB health check failed:', error)
    return false
  }
}

// Graceful shutdown for MongoDB
export async function closeMongoConnections(): Promise<void> {
  try {
    if (mongooseConnection) {
      await mongoose.disconnect()
      mongooseConnection = null
      console.log('🔌 Mongoose disconnected')
    }
    
    if (mongoClient) {
      await mongoClient.close()
      mongoClient = null
      mongoDb = null
      console.log('🔌 MongoDB client disconnected')
    }
  } catch (error) {
    console.error('MongoDB close connections error:', error)
  }
}

// Database factory - choose between Redis and MongoDB
export class DatabaseFactory {
  static async getPreferredDatabase(): Promise<'redis' | 'mongodb' | 'both'> {
    const redisAvailable = await import('./redis').then(async ({ checkRedisHealth }) => {
      try {
        return await checkRedisHealth()
      } catch {
        return false
      }
    }).catch(() => false)
    
    const mongoAvailable = await checkMongoHealth().catch(() => false)
    
    if (redisAvailable && mongoAvailable) {
      return 'both'
    } else if (redisAvailable) {
      return 'redis'
    } else if (mongoAvailable) {
      return 'mongodb'
    } else {
      console.warn('⚠️ No database connections available')
      return 'mongodb' // Default fallback
    }
  }
  
  static async getCacheService(): Promise<any> {
    const dbType = await this.getPreferredDatabase()
    
    if (dbType === 'redis' || dbType === 'both') {
      try {
        const { redisCache } = await import('./redis')
        return redisCache
      } catch (error) {
        console.warn('Redis not available, falling back to MongoDB caching')
      }
    }
    
    // Fallback to MongoDB-based caching
    return {
      set: async (key: string, value: any, ttl?: number) => {
        try {
          const db = await getMongoDb()
          const cache = db.collection('cache')
          const expiresAt = ttl ? new Date(Date.now() + ttl * 1000) : null
          
          await cache.updateOne(
            { key },
            { 
              $set: { 
                key, 
                value: JSON.stringify(value), 
                createdAt: new Date(),
                expiresAt
              } 
            },
            { upsert: true }
          )
        } catch (error) {
          console.error('MongoDB cache set error:', error)
        }
      },
      get: async (key: string) => {
        try {
          const db = await getMongoDb()
          const cache = db.collection('cache')
          const result = await cache.findOne({ 
            key,
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: new Date() } }
            ]
          })
          
          return result ? JSON.parse(result.value) : null
        } catch (error) {
          console.error('MongoDB cache get error:', error)
          return null
        }
      },
      del: async (key: string) => {
        try {
          const db = await getMongoDb()
          const cache = db.collection('cache')
          await cache.deleteOne({ key })
        } catch (error) {
          console.error('MongoDB cache delete error:', error)
        }
      }
    }
  }
  
  static async getAnalyticsService(): Promise<any> {
    const dbType = await this.getPreferredDatabase()
    
    if (dbType === 'redis' || dbType === 'both') {
      try {
        const { redisAnalytics } = await import('./redis')
        return redisAnalytics
      } catch (error) {
        console.warn('Redis not available, using MongoDB analytics')
      }
    }
    
    return mongoAnalytics
  }
  
  static async getSessionService(): Promise<any> {
    const dbType = await this.getPreferredDatabase()
    
    if (dbType === 'redis' || dbType === 'both') {
      try {
        const { redisSession } = await import('./redis')
        return redisSession
      } catch (error) {
        console.warn('Redis not available, using MongoDB sessions')
      }
    }
    
    return mongoSession
  }
}