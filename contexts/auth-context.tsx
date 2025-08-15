"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  permissions: string[]
  department?: string
  supervisor?: string
}

export type UserRole = "superadmin" | "admin" | "gerente" | "operator" | "subdistributor" | "vendor"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginAsDemo: (role: UserRole) => Promise<boolean>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  hasPermission: (permission: string) => boolean
  hasRole: (roles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for different roles
const demoUsers: Record<UserRole, User> = {
  superadmin: {
    id: 'demo-superadmin',
    name: 'Carlos Rodríguez',
    email: 'superadmin@omv.com',
    role: 'superadmin',
    avatar: '/placeholder-user.jpg',
    department: 'Administración',
    permissions: [
      'users.read', 'users.write', 'users.delete',
      'sims.read', 'sims.write', 'sims.delete',
      'customers.read', 'customers.write', 'customers.delete',
      'tickets.read', 'tickets.write', 'tickets.assign',
      'balance.read', 'balance.write', 'balance.transfer',
      'reports.read', 'reports.generate', 'reports.export',
      'settings.read', 'settings.write',
      'webhooks.read', 'webhooks.write',
      'warehouse.read', 'warehouse.write',
      'billing.read', 'billing.write',
      'plans.read', 'plans.write'
    ]
  },
  admin: {
    id: 'demo-admin',
    name: 'María González',
    email: 'admin@omv.com',
    role: 'admin',
    avatar: '/placeholder-user.jpg',
    department: 'Operaciones',
    supervisor: 'Carlos Rodríguez',
    permissions: [
      'users.read', 'users.write',
      'sims.read', 'sims.write',
      'customers.read', 'customers.write',
      'tickets.read', 'tickets.write', 'tickets.assign',
      'balance.read', 'balance.write', 'balance.transfer',
      'reports.read', 'reports.generate',
      'warehouse.read', 'warehouse.write',
      'billing.read',
      'plans.read', 'plans.write'
    ]
  },
  gerente: {
    id: 'demo-gerente',
    name: 'Juan Martínez',
    email: 'gerente@omv.com',
    role: 'gerente',
    avatar: '/placeholder-user.jpg',
    department: 'Ventas',
    supervisor: 'María González',
    permissions: [
      'users.read',
      'sims.read', 'sims.write',
      'customers.read', 'customers.write',
      'tickets.read', 'tickets.write',
      'balance.read', 'balance.transfer',
      'reports.read', 'reports.generate',
      'warehouse.read',
      'plans.read'
    ]
  },
  operator: {
    id: 'demo-operator',
    name: 'Ana López',
    email: 'operator@omv.com',
    role: 'operator',
    avatar: '/placeholder-user.jpg',
    department: 'Operaciones',
    supervisor: 'Juan Martínez',
    permissions: [
      'sims.read', 'sims.write',
      'customers.read', 'customers.write',
      'tickets.read', 'tickets.write',
      'balance.read',
      'activations.read', 'activations.write',
      'recharges.read', 'recharges.write'
    ]
  },
  subdistributor: {
    id: 'demo-subdistributor',
    name: 'Pedro Sánchez',
    email: 'subdistributor@omv.com',
    role: 'subdistributor',
    avatar: '/placeholder-user.jpg',
    department: 'Distribución',
    supervisor: 'Ana López',
    permissions: [
      'sims.read',
      'customers.read', 'customers.write',
      'tickets.read', 'tickets.write',
      'balance.read',
      'activations.read', 'activations.write',
      'recharges.read', 'recharges.write'
    ]
  },
  vendor: {
    id: 'demo-vendor',
    name: 'Laura Díaz',
    email: 'vendor@omv.com',
    role: 'vendor',
    avatar: '/placeholder-user.jpg',
    department: 'Ventas',
    supervisor: 'Pedro Sánchez',
    permissions: [
      'customers.read', 'customers.write',
      'tickets.read', 'tickets.write',
      'balance.read',
      'activations.read', 'activations.write',
      'recharges.read', 'recharges.write'
    ]
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Check for existing session
        const storedUser = localStorage.getItem('omv_user')
        const sessionToken = localStorage.getItem('omv_session_token')
        const sessionExpiry = localStorage.getItem('omv_session_expiry')

        if (storedUser && sessionToken && sessionExpiry) {
          const expiryTime = new Date(sessionExpiry)
          const now = new Date()

          if (now < expiryTime) {
            // Session is still valid
            setUser(JSON.parse(storedUser))
          } else {
            // Session expired, clear storage
            clearAuthStorage()
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        clearAuthStorage()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const clearAuthStorage = () => {
    localStorage.removeItem('omv_user')
    localStorage.removeItem('omv_session_token')
    localStorage.removeItem('omv_session_expiry')
    sessionStorage.clear()
  }

  const createSession = (userData: User) => {
    // Create session with 8 hour expiry
    const sessionExpiry = new Date()
    sessionExpiry.setHours(sessionExpiry.getHours() + 8)
    
    const sessionToken = `omv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // Store in localStorage
    localStorage.setItem('omv_user', JSON.stringify(userData))
    localStorage.setItem('omv_session_token', sessionToken)
    localStorage.setItem('omv_session_expiry', sessionExpiry.toISOString())

    setUser(userData)
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock authentication - check against demo users
      const demoUser = Object.values(demoUsers).find(u => u.email === email)
      
      if (demoUser && password) {
        createSession(demoUser)
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const loginAsDemo = async (role: UserRole): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const demoUser = demoUsers[role]
      if (demoUser) {
        createSession(demoUser)
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Demo login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = async (): Promise<void> => {
    setIsLoading(true)
    
    try {
      // Simulate API call to invalidate session on server
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Clear all authentication data
      clearAuthStorage()
      
      // Clear user state
      setUser(null)
      
      // Clear any cached data
      if (typeof window !== 'undefined') {
        // Clear any other app-specific storage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith('omv_')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      }
      
      setIsLoading(false)
      
    } catch (error) {
      console.error('Logout error:', error)
      
      // Even if logout fails on server, clear local state
      clearAuthStorage()
      setUser(null)
      setIsLoading(false)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('omv_user', JSON.stringify(updatedUser))
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false
    return roles.includes(user.role)
  }

  // Auto-logout on session expiry
  useEffect(() => {
    if (!user) return

    const checkSessionExpiry = () => {
      const sessionExpiry = localStorage.getItem('omv_session_expiry')
      if (sessionExpiry) {
        const expiryTime = new Date(sessionExpiry)
        const now = new Date()
        
        if (now >= expiryTime) {
          logout()
        }
      }
    }

    // Check every minute
    const interval = setInterval(checkSessionExpiry, 60000)
    
    return () => clearInterval(interval)
  }, [user])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginAsDemo,
    logout,
    updateUser,
    hasPermission,
    hasRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { demoUsers }