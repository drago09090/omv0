import mongoose, { Schema, Document, Model } from 'mongoose'

// User Schema
export interface IUser extends Document {
  name: string
  email: string
  role: 'superadmin' | 'admin' | 'gerente' | 'operator' | 'subdistributor' | 'vendor'
  permissions: string[]
  department?: string
  supervisor?: string
  avatar?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true,
    enum: ['superadmin', 'admin', 'gerente', 'operator', 'subdistributor', 'vendor']
  },
  permissions: [{ type: String }],
  department: { type: String },
  supervisor: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Customer Schema
export interface ICustomer extends Document {
  name: string
  email: string
  phone: string
  address?: string
  createdBy: string
  status: 'active' | 'suspended' | 'inactive'
  totalSpent: number
  lastActivity?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  createdBy: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  totalSpent: { type: Number, default: 0 },
  lastActivity: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// SIM Schema
export interface ISim extends Document {
  iccid: string
  msisdn: string
  operator: string
  status: 'available' | 'active' | 'suspended' | 'inactive'
  customerId?: string
  planId?: string
  activationDate?: Date
  expiryDate?: Date
  warehouseId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const SimSchema = new Schema<ISim>({
  iccid: { type: String, required: true, unique: true },
  msisdn: { type: String, required: true, unique: true },
  operator: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['available', 'active', 'suspended', 'inactive'],
    default: 'available'
  },
  customerId: { type: String },
  planId: { type: String },
  activationDate: { type: Date },
  expiryDate: { type: Date },
  warehouseId: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Transaction Schema
export interface ITransaction extends Document {
  type: 'activation' | 'recharge' | 'transfer' | 'suspension'
  customerId: string
  simId?: string
  amount: number
  commission?: number
  status: 'pending' | 'completed' | 'failed'
  operatorId: string
  reference?: string
  description?: string
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  type: { 
    type: String, 
    required: true,
    enum: ['activation', 'recharge', 'transfer', 'suspension']
  },
  customerId: { type: String, required: true },
  simId: { type: String },
  amount: { type: Number, required: true },
  commission: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  operatorId: { type: String, required: true },
  reference: { type: String },
  description: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Ticket Schema
export interface ITicket extends Document {
  title: string
  description: string
  category: 'technical' | 'commercial' | 'billing' | 'general'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  customerId?: string
  createdBy: string
  assignedTo?: string
  comments: Array<{
    author: string
    message: string
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}

const TicketSchema = new Schema<ITicket>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['technical', 'commercial', 'billing', 'general']
  },
  priority: { 
    type: String, 
    required: true,
    enum: ['low', 'medium', 'high', 'critical']
  },
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  customerId: { type: String },
  createdBy: { type: String, required: true },
  assignedTo: { type: String },
  comments: [{
    author: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Plan Schema
export interface IPlan extends Document {
  name: string
  type: 'principal' | 'complementary'
  data: string
  minutes: string
  sms: string
  validity: string
  baseCost: number
  retailPrice: number
  status: 'active' | 'inactive'
  description?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const PlanSchema = new Schema<IPlan>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['principal', 'complementary']
  },
  data: { type: String, required: true },
  minutes: { type: String, required: true },
  sms: { type: String, required: true },
  validity: { type: String, required: true },
  baseCost: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active'
  },
  description: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Warehouse Schema
export interface IWarehouse extends Document {
  name: string
  location: string
  manager: string
  totalSims: number
  availableSims: number
  assignedSims: number
  reservedSims: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

const WarehouseSchema = new Schema<IWarehouse>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  manager: { type: String, required: true },
  totalSims: { type: Number, default: 0 },
  availableSims: { type: Number, default: 0 },
  assignedSims: { type: Number, default: 0 },
  reservedSims: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Webhook Log Schema
export interface IWebhookLog extends Document {
  endpoint: string
  event: string
  method: string
  status: 'success' | 'failed' | 'pending' | 'timeout'
  statusCode?: number
  responseTime?: number
  payload: any
  response?: any
  retryCount: number
  createdAt: Date
}

const WebhookLogSchema = new Schema<IWebhookLog>({
  endpoint: { type: String, required: true },
  event: { type: String, required: true },
  method: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['success', 'failed', 'pending', 'timeout']
  },
  statusCode: { type: Number },
  responseTime: { type: Number },
  payload: { type: Schema.Types.Mixed, required: true },
  response: { type: Schema.Types.Mixed },
  retryCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
})

// Create indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, isActive: 1 })

CustomerSchema.index({ email: 1 })
CustomerSchema.index({ phone: 1 })
CustomerSchema.index({ createdBy: 1 })
CustomerSchema.index({ status: 1 })

SimSchema.index({ iccid: 1 })
SimSchema.index({ msisdn: 1 })
SimSchema.index({ status: 1 })
SimSchema.index({ customerId: 1 })
SimSchema.index({ warehouseId: 1 })

TransactionSchema.index({ customerId: 1, createdAt: -1 })
TransactionSchema.index({ operatorId: 1, createdAt: -1 })
TransactionSchema.index({ status: 1 })
TransactionSchema.index({ type: 1, createdAt: -1 })

TicketSchema.index({ createdBy: 1, createdAt: -1 })
TicketSchema.index({ assignedTo: 1, status: 1 })
TicketSchema.index({ customerId: 1 })
TicketSchema.index({ status: 1, priority: 1 })

PlanSchema.index({ status: 1 })
PlanSchema.index({ type: 1 })

WarehouseSchema.index({ status: 1 })
WarehouseSchema.index({ manager: 1 })

WebhookLogSchema.index({ endpoint: 1, createdAt: -1 })
WebhookLogSchema.index({ status: 1, createdAt: -1 })
WebhookLogSchema.index({ event: 1, createdAt: -1 })

// Export models
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export const Customer: Model<ICustomer> = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema)
export const Sim: Model<ISim> = mongoose.models.Sim || mongoose.model<ISim>('Sim', SimSchema)
export const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema)
export const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema)
export const Plan: Model<IPlan> = mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema)
export const Warehouse: Model<IWarehouse> = mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema)
export const WebhookLog: Model<IWebhookLog> = mongoose.models.WebhookLog || mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema)