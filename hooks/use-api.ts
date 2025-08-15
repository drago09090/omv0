import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/hooks/use-toast'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export function useApi() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const apiCall = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed')
      }
      
      return data
    } catch (error) {
      console.error('API call error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Users API
  const users = {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters)
      return apiCall(`/users?${params}`)
    },
    getById: (id: string) => apiCall(`/users/${id}`),
    create: (userData: any) => apiCall('/users', {
      method: 'POST',
      body: JSON.stringify({ ...userData, createdBy: user?.id })
    }),
    update: (id: string, userData: any) => apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...userData, updatedBy: user?.id })
    }),
    delete: (id: string) => apiCall(`/users/${id}`, { method: 'DELETE' })
  }

  // Customers API
  const customers = {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters)
      return apiCall(`/customers?${params}`)
    },
    getById: (id: string) => apiCall(`/customers/${id}`),
    create: (customerData: any) => apiCall('/customers', {
      method: 'POST',
      body: JSON.stringify({ ...customerData, createdBy: user?.id })
    }),
    update: (id: string, customerData: any) => apiCall(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...customerData, updatedBy: user?.id })
    })
  }

  // SIMs API
  const sims = {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters)
      return apiCall(`/sims?${params}`)
    },
    create: (simData: any) => apiCall('/sims', {
      method: 'POST',
      body: JSON.stringify({ ...simData, createdBy: user?.id })
    }),
    update: (id: string, simData: any) => apiCall(`/sims/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...simData, updatedBy: user?.id })
    })
  }

  // Transactions API
  const transactions = {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters)
      return apiCall(`/transactions?${params}`)
    },
    create: (transactionData: any) => apiCall('/transactions', {
      method: 'POST',
      body: JSON.stringify({ ...transactionData, operatorId: user?.id })
    })
  }

  // Tickets API
  const tickets = {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters)
      return apiCall(`/tickets?${params}`)
    },
    create: (ticketData: any) => apiCall('/tickets', {
      method: 'POST',
      body: JSON.stringify({ ...ticketData, createdBy: user?.id })
    }),
    update: (id: string, ticketData: any) => apiCall(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...ticketData, updatedBy: user?.id })
    }),
    addComment: (id: string, message: string) => apiCall(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message, author: user?.name || 'Unknown' })
    })
  }

  // Activations API
  const activations = {
    create: (activationData: any) => apiCall('/activations', {
      method: 'POST',
      body: JSON.stringify({ ...activationData, operatorId: user?.id })
    })
  }

  // Recharges API
  const recharges = {
    create: (rechargeData: any) => apiCall('/recharges', {
      method: 'POST',
      body: JSON.stringify({ ...rechargeData, operatorId: user?.id })
    })
  }

  // Balance API
  const balance = {
    transfer: (transferData: any) => apiCall('/balance/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData)
    })
  }

  // Plans API
  const plans = {
    getAll: (filters?: Record<string, string>) => {
      const params = new URLSearchParams(filters)
      return apiCall(`/plans?${params}`)
    },
    create: (planData: any) => apiCall('/plans', {
      method: 'POST',
      body: JSON.stringify({ ...planData, createdBy: user?.id })
    })
  }

  // Warehouse API
  const warehouse = {
    getAll: () => apiCall('/warehouse'),
    getInventory: (warehouseId: string) => apiCall(`/warehouse?warehouseId=${warehouseId}`),
    create: (warehouseData: any) => apiCall('/warehouse', {
      method: 'POST',
      body: JSON.stringify(warehouseData)
    })
  }

  // Analytics API
  const analytics = {
    getUserStats: (userId: string, days: number = 7) => 
      apiCall(`/analytics?userId=${userId}&days=${days}`),
    getGlobalMetrics: (activity: string, days: number = 30) => 
      apiCall(`/analytics?activity=${activity}&days=${days}`),
    track: (activity: string, metadata?: any) => apiCall('/analytics', {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id, activity, metadata })
    })
  }

  return {
    loading,
    users,
    customers,
    sims,
    transactions,
    tickets,
    activations,
    recharges,
    balance,
    plans,
    warehouse,
    analytics
  }
}