"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Webhook, CheckCircle, XCircle, Clock, RefreshCw, Eye } from 'lucide-react'
import type { UserRole } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/use-permissions"

interface WebhookLogsModuleProps {
  userRole: UserRole
}

const webhookLogs = [
  {
    id: "WH001",
    endpoint: "https://api.partner.com/webhooks/activation",
    event: "sim.activated",
    method: "POST",
    status: "success",
    statusCode: 200,
    responseTime: "245ms",
    timestamp: "2024-01-15 14:30:25",
    payload: {
      event: "sim.activated",
      sim_id: "8934071234567890123",
      msisdn: "+52 55 1234 5678",
      customer_id: "CUST001",
      plan: "basic_500mb"
    },
    response: {
      status: "ok",
      message: "Activation processed successfully"
    }
  },
  {
    id: "WH002",
    endpoint: "https://api.partner.com/webhooks/recharge",
    event: "balance.recharged",
    method: "POST",
    status: "failed",
    statusCode: 500,
    responseTime: "5000ms",
    timestamp: "2024-01-15 14:25:10",
    payload: {
      event: "balance.recharged",
      customer_id: "CUST002",
      amount: 20.00,
      currency: "MXN"
    },
    response: {
      error: "Internal server error",
      message: "Database connection failed"
    }
  },
  {
    id: "WH003",
    endpoint: "https://api.partner.com/webhooks/suspension",
    event: "sim.suspended",
    method: "POST",
    status: "pending",
    statusCode: null,
    responseTime: null,
    timestamp: "2024-01-15 14:20:15",
    payload: {
      event: "sim.suspended",
      sim_id: "8934071234567890124",
      reason: "payment_overdue"
    },
    response: null
  }
]

const statusColors = {
  success: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  timeout: "bg-orange-100 text-orange-800"
}

const statusIcons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
  timeout: Clock
}

export function WebhookLogsModule({ userRole }: WebhookLogsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const { canPerformAction } = usePermissions()

  const filteredLogs = webhookLogs.filter(log => {
    const matchesSearch = 
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const canViewLogs = canPerformAction('webhooks.read')

  if (!canViewLogs) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600">No tienes permisos para ver los logs de webhooks.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Webhook className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Logs de Webhooks</h1>
            <p className="text-gray-600">Monitorear llamadas y respuestas de webhooks</p>
          </div>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Llamadas</p>
                <p className="text-2xl font-bold text-blue-600">1,456</p>
              </div>
              <Webhook className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exitosas</p>
                <p className="text-2xl font-bold text-green-600">1,432</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fallidas</p>
                <p className="text-2xl font-bold text-red-600">23</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-purple-600">98.4%</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por endpoint, evento o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="success">Exitoso</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="timeout">Timeout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => {
                const StatusIcon = statusIcons[log.status as keyof typeof statusIcons]
                return (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.id}</TableCell>
                    <TableCell className="font-mono text-sm max-w-xs truncate">{log.endpoint}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.event}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className="h-4 w-4" />
                        <Badge className={statusColors[log.status as keyof typeof statusColors]}>
                          {log.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.statusCode && (
                        <Badge variant={log.statusCode >= 200 && log.statusCode < 300 ? "default" : "destructive"}>
                          {log.statusCode}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{log.responseTime || "-"}</TableCell>
                    <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedLog(log)}
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalle del Webhook - {selectedLog.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Endpoint</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.endpoint}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Evento</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.event}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Método</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.method}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={statusColors[selectedLog.status as keyof typeof statusColors]}>
                      {selectedLog.status}
                    </Badge>
                    {selectedLog.statusCode && (
                      <Badge variant={selectedLog.statusCode >= 200 && selectedLog.statusCode < 300 ? "default" : "destructive"}>
                        {selectedLog.statusCode}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Payload */}
              <div>
                <Label className="text-sm font-medium text-gray-600">Payload Enviado</Label>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              {/* Response */}
              {selectedLog.response && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Respuesta</Label>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.response, null, 2)}
                  </pre>
                </div>
              )}

              {/* Timing Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tiempo de Respuesta</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.responseTime || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Timestamp</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedLog.timestamp}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Cerrar
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Reintentar Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
