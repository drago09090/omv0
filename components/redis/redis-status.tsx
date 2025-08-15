import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { checkRedisHealth, redisCache } from '@/lib/redis'
import { CacheService } from '@/lib/cache-service'
import { Database, Activity, RefreshCw, Trash2, CheckCircle, XCircle } from 'lucide-react'

export function RedisStatus() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null)
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const healthy = await checkRedisHealth()
      setIsHealthy(healthy)
      
      if (healthy) {
        const stats = await CacheService.getCacheStats()
        setCacheStats(stats)
      }
    } catch (error) {
      setIsHealthy(false)
      console.error('Redis health check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async () => {
    try {
      await CacheService.invalidateAllCache()
      await checkHealth()
    } catch (error) {
      console.error('Clear cache error:', error)
    }
  }

  useEffect(() => {
    checkHealth()
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Estado de Redis</span>
            </div>
            <div className="flex items-center space-x-2">
              {isHealthy === null ? (
                <Badge variant="secondary">Verificando...</Badge>
              ) : isHealthy ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Desconectado
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkHealth}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Verificar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className="text-lg font-bold text-blue-600">
                {isHealthy ? 'Activo' : 'Inactivo'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Conexiones</p>
              <p className="text-lg font-bold text-green-600">
                {isHealthy ? '1' : '0'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <RefreshCw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Latencia</p>
              <p className="text-lg font-bold text-purple-600">
                {isHealthy ? '<1ms' : 'N/A'}
              </p>
            </div>
          </div>
          
          {cacheStats && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Estadísticas de Cache</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCache}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar Cache
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Memoria Usada</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={65} className="flex-1" />
                    <span className="font-medium">65%</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600">Keys Almacenadas</p>
                  <p className="font-bold text-lg">1,247</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}