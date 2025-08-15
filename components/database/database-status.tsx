import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDatabaseHealth } from '@/hooks/use-mongodb'
import { checkMongoHealth, closeMongoConnections } from '@/lib/mongodb'
import { Database, Activity, RefreshCw, Trash2, CheckCircle, XCircle, Wifi, WifiOff, Server, HardDrive } from 'lucide-react'

export function DatabaseStatus() {
  const { redisHealth, mongoHealth, preferredDb, checkHealth } = useDatabaseHealth()
  const [loading, setLoading] = useState(false)
  const [mongoStats, setMongoStats] = useState<any>(null)

  const getMongoStats = async () => {
    try {
      const { getMongoDb } = await import('@/lib/mongodb')
      const db = await getMongoDb()
      
      // Get database stats
      const stats = await db.stats()
      const collections = await db.listCollections().toArray()
      
      setMongoStats({
        ...stats,
        collections: collections.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Get MongoDB stats error:', error)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await checkHealth()
      if (mongoHealth) {
        await getMongoStats()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReconnect = async () => {
    setLoading(true)
    try {
      // Close existing connections
      await closeMongoConnections()
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check health again
      await checkHealth()
      
      if (mongoHealth) {
        await getMongoStats()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mongoHealth) {
      getMongoStats()
    }
  }, [mongoHealth])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Database Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Redis Cache</span>
              </div>
              {redisHealth === null ? (
                <Badge variant="secondary">Verificando...</Badge>
              ) : redisHealth ? (
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {redisHealth ? (
                <Wifi className="h-12 w-12 text-green-500 mx-auto mb-2" />
              ) : (
                <WifiOff className="h-12 w-12 text-red-500 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {redisHealth ? 'Cache y sesiones activos' : 'Cache no disponible'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>MongoDB</span>
              </div>
              {mongoHealth === null ? (
                <Badge variant="secondary">Verificando...</Badge>
              ) : mongoHealth ? (
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {mongoHealth ? (
                <HardDrive className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              ) : (
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              )}
              <p className="text-sm text-gray-600">
                {mongoHealth ? 'Base de datos principal' : 'Base de datos no disponible'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Sistema</span>
              </div>
              <Badge className={
                preferredDb === 'both' ? 'bg-green-100 text-green-800' :
                preferredDb === 'redis' ? 'bg-blue-100 text-blue-800' :
                preferredDb === 'mongodb' ? 'bg-purple-100 text-purple-800' :
                'bg-red-100 text-red-800'
              }>
                {preferredDb === 'both' ? 'Híbrido' :
                 preferredDb === 'redis' ? 'Redis' :
                 preferredDb === 'mongodb' ? 'MongoDB' : 'Sin conexión'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Activity className={`h-12 w-12 mx-auto mb-2 ${
                preferredDb ? 'text-green-500' : 'text-red-500'
              }`} />
              <p className="text-sm text-gray-600">
                {preferredDb === 'both' ? 'Ambas bases de datos activas' :
                 preferredDb ? 'Sistema operativo' : 'Sistema sin conexión'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Details */}
      <Tabs defaultValue="mongodb" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mongodb">MongoDB</TabsTrigger>
          <TabsTrigger value="redis">Redis</TabsTrigger>
          <TabsTrigger value="hybrid">Sistema Híbrido</TabsTrigger>
        </TabsList>

        <TabsContent value="mongodb" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Estado de MongoDB</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReconnect}
                    disabled={loading}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Reconectar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mongoHealth ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Estado</p>
                      <p className="text-lg font-bold text-green-600">Conectado</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Colecciones</p>
                      <p className="text-lg font-bold text-blue-600">
                        {mongoStats?.collections || 'N/A'}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <HardDrive className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Tamaño DB</p>
                      <p className="text-lg font-bold text-purple-600">
                        {mongoStats ? formatBytes(mongoStats.dataSize) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {mongoStats && (
                    <div className="space-y-4">
                      <h4 className="font-semibold">Estadísticas Detalladas</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Documentos</p>
                          <p className="font-bold text-lg">{mongoStats.objects?.toLocaleString() || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Índices</p>
                          <p className="font-bold text-lg">{mongoStats.indexes || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tamaño de Índices</p>
                          <p className="font-bold text-lg">
                            {mongoStats.indexSize ? formatBytes(mongoStats.indexSize) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Almacenamiento</p>
                          <p className="font-bold text-lg">
                            {mongoStats.storageSize ? formatBytes(mongoStats.storageSize) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">MongoDB Desconectado</h3>
                  <p className="text-gray-600 mb-4">No se puede conectar a la base de datos MongoDB</p>
                  <Button onClick={handleReconnect} disabled={loading}>
                    <Database className="mr-2 h-4 w-4" />
                    Intentar Reconectar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="h-5 w-5" />
                <span>Estado de Redis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {redisHealth ? (
                <div className="text-center py-8">
                  <Wifi className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Redis Conectado</h3>
                  <p className="text-gray-600">Cache y sesiones funcionando correctamente</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <WifiOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Redis Desconectado</h3>
                  <p className="text-gray-600 mb-4">El sistema funcionará con MongoDB únicamente</p>
                  <Badge variant="secondary">Fallback automático activado</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hybrid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Sistema Híbrido</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <Activity className={`h-16 w-16 mx-auto mb-4 ${
                    preferredDb === 'both' ? 'text-green-500' : 'text-yellow-500'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {preferredDb === 'both' ? 'Sistema Híbrido Activo' : 'Modo Fallback'}
                  </h3>
                  <p className="text-gray-600">
                    {preferredDb === 'both' 
                      ? 'Redis para cache y MongoDB para datos persistentes'
                      : 'Funcionando con una sola base de datos'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Server className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Redis</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {redisHealth ? '✅ Cache rápido' : '❌ No disponible'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sesiones, cache, notificaciones en tiempo real
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">MongoDB</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {mongoHealth ? '✅ Datos persistentes' : '❌ No disponible'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Usuarios, clientes, SIMs, transacciones
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🔄 Estrategia de Fallback</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Si Redis falla: MongoDB maneja cache y sesiones</li>
                    <li>• Si MongoDB falla: Redis maneja datos temporalmente</li>
                    <li>• Sistema siempre operativo con al menos una DB</li>
                    <li>• Reconexión automática en segundo plano</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Verificar Estado
                  </Button>
                  <Button 
                    onClick={handleReconnect}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Reconectar Todo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}