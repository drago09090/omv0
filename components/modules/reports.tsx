"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { Download, FileText, BarChart3, Calendar, Filter, Users, Smartphone, CreditCard, Webhook, TrendingUp, Eye, Mail, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import type { UserRole } from "@/components/dashboard"

interface ReportsProps {
  userRole: UserRole
}

export function Reports({ userRole }: ReportsProps) {
  const [dateRange, setDateRange] = useState<any>(null)
  const [selectedUser, setSelectedUser] = useState("all")
  const [reportCategory, setReportCategory] = useState("all")
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [reportProgress, setReportProgress] = useState(0)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState("")
  const [reportConfig, setReportConfig] = useState({
    includeCharts: true,
    includeDetails: true,
    groupByDate: true,
    includeComparisons: false,
    emailReport: false,
    reportEmail: ""
  })

  const reportTypes = [
    {
      id: "tickets",
      name: "Reporte de Tickets",
      description: "Análisis completo de tickets de soporte",
      icon: "🎫",
      estimatedTime: "2-3 minutos",
      fields: ["Estado", "Prioridad", "Tiempo de resolución", "Agente asignado"],
      color: "blue"
    },
    {
      id: "sims",
      name: "Reporte de SIMs",
      description: "Estado y movimientos de tarjetas SIM",
      icon: "📱",
      estimatedTime: "1-2 minutos",
      fields: ["Estado", "Operador", "Plan asignado", "Fecha de activación"],
      color: "purple"
    },
    {
      id: "transactions",
      name: "Reporte de Transacciones",
      description: "Análisis financiero y de transacciones",
      icon: "💰",
      estimatedTime: "3-5 minutos",
      fields: ["Tipo", "Monto", "Estado", "Método de pago"],
      color: "green"
    },
    {
      id: "webhooks",
      name: "Reporte de Webhooks",
      description: "Estado y rendimiento de webhooks",
      icon: "🔗",
      estimatedTime: "1-2 minutos",
      fields: ["Endpoint", "Estado", "Tiempo de respuesta", "Errores"],
      color: "orange"
    },
    {
      id: "earnings",
      name: "Reporte de Ganancias",
      description: "Análisis de rentabilidad y comisiones",
      icon: "📈",
      estimatedTime: "2-4 minutos",
      fields: ["Ingresos", "Comisiones", "Costos", "Margen"],
      color: "indigo"
    },
    {
      id: "users",
      name: "Reporte de Usuarios",
      description: "Actividad y rendimiento de usuarios",
      icon: "👥",
      estimatedTime: "1-2 minutos",
      fields: ["Actividad", "Rendimiento", "Accesos", "Permisos"],
      color: "pink"
    }
  ]

  const generateReport = async (reportType: string) => {
    setIsGeneratingReport(true)
    setReportProgress(0)
    
    const reportInfo = reportTypes.find(r => r.id === reportType)
    
    // Simulate report generation with realistic progress
    const progressSteps = [
      { progress: 15, message: "Conectando a la base de datos..." },
      { progress: 30, message: "Extrayendo datos..." },
      { progress: 50, message: "Procesando información..." },
      { progress: 70, message: "Generando gráficos..." },
      { progress: 85, message: "Aplicando formato..." },
      { progress: 100, message: "Finalizando reporte..." }
    ]

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800))
      setReportProgress(step.progress)
    }

    // Complete the process
    setTimeout(() => {
      setIsGeneratingReport(false)
      setReportModalOpen(false)
      setReportProgress(0)
      
      toast({
        title: "✅ Reporte generado exitosamente",
        description: `El ${reportInfo?.name} ha sido creado y está listo para descargar`
      })

      // If email is enabled, send email notification
      if (reportConfig.emailReport && reportConfig.reportEmail) {
        setTimeout(() => {
          toast({
            title: "📧 Reporte enviado por email",
            description: `El reporte ha sido enviado a ${reportConfig.reportEmail}`
          })
        }, 1500)
      }

      // Reset form
      setReportConfig({
        includeCharts: true,
        includeDetails: true,
        groupByDate: true,
        includeComparisons: false,
        emailReport: false,
        reportEmail: ""
      })
    }, 500)
  }

  const openReportModal = (reportType: string) => {
    setSelectedReportType(reportType)
    setReportModalOpen(true)
    setReportProgress(0)
    setIsGeneratingReport(false)
  }

  const exportReport = (format: string) => {
    toast({
      title: `📄 Exportando ${format.toUpperCase()}`,
      description: "El archivo se descargará en unos momentos"
    })
    
    // Simulate file download
    setTimeout(() => {
      toast({
        title: "✅ Descarga completada",
        description: `El archivo ${format.toUpperCase()} ha sido descargado exitosamente`
      })
    }, 2000)
  }

  const applyFilters = () => {
    toast({
      title: "🔍 Filtros aplicados",
      description: "Los datos han sido filtrados según los criterios seleccionados"
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Generar y exportar reportes del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => exportReport('csv')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => exportReport('pdf')}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Reporte</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateRange" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Rango de Fechas</span>
              </Label>
              <DatePickerWithRange />
            </div>
            {["superadmin", "admin"].includes(userRole) && (
              <div>
                <Label htmlFor="user" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Usuario</span>
                </Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="juan">Juan Pérez</SelectItem>
                    <SelectItem value="maria">María García</SelectItem>
                    <SelectItem value="carlos">Carlos López</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select value={reportCategory} onValueChange={setReportCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="activations">Activaciones</SelectItem>
                  <SelectItem value="recharges">Recargas</SelectItem>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="balance">Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                onClick={applyFilters}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generación Rápida de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-${report.color}-100 rounded-lg flex items-center justify-center`}>
                      <span className="text-2xl">{report.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{report.name}</h3>
                      <p className="text-xs text-gray-600">{report.description}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {report.estimatedTime}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {report.fields.slice(0, 2).map((field, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                    {report.fields.length > 2 && (
                      <span className="text-xs text-gray-500">+{report.fields.length - 2} más</span>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => openReportModal(report.id)}
                >
                  <BarChart3 className="mr-2 h-3 w-3" />
                  Generar Reporte
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets" className="flex items-center space-x-2">
            <span>🎫</span>
            <span>Tickets</span>
          </TabsTrigger>
          <TabsTrigger value="sims" className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>SIMs</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Transacciones</span>
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Webhook className="h-4 w-4" />
            <span>Webhooks</span>
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Ganancias</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reporte de Tickets</span>
                <Button size="sm" variant="outline" onClick={() => openReportModal('tickets')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">45</p>
                  <p className="text-sm text-gray-600">Tickets Creados</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">38</p>
                  <p className="text-sm text-gray-600">Tickets Resueltos</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">2.5h</p>
                  <p className="text-sm text-gray-600">Tiempo Promedio</p>
                </div>
              </div>
              <p className="text-gray-600">Datos detallados del período seleccionado...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reporte de SIMs</span>
                <Button size="sm" variant="outline" onClick={() => openReportModal('sims')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">1,247</p>
                  <p className="text-sm text-gray-600">Disponibles</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">2,156</p>
                  <p className="text-sm text-gray-600">Activas</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">89</p>
                  <p className="text-sm text-gray-600">Suspendidas</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">234</p>
                  <p className="text-sm text-gray-600">Reservadas</p>
                </div>
              </div>
              <p className="text-gray-600">Distribución y movimientos de SIMs...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reporte de Transacciones</span>
                <Button size="sm" variant="outline" onClick={() => openReportModal('transactions')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">$45,231</p>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">1,234</p>
                  <p className="text-sm text-gray-600">Transacciones</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">$36.65</p>
                  <p className="text-sm text-gray-600">Ticket Promedio</p>
                </div>
              </div>
              <p className="text-gray-600">Análisis detallado de transacciones...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reporte de Webhooks</span>
                <Button size="sm" variant="outline" onClick={() => openReportModal('webhooks')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">98.5%</p>
                  <p className="text-sm text-gray-600">Tasa de Éxito</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">23</p>
                  <p className="text-sm text-gray-600">Fallos</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">1,456</p>
                  <p className="text-sm text-gray-600">Total Enviados</p>
                </div>
              </div>
              <p className="text-gray-600">Estado y rendimiento de webhooks...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reporte de Ganancias</span>
                <Button size="sm" variant="outline" onClick={() => openReportModal('earnings')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalle
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">$12,450</p>
                  <p className="text-sm text-gray-600">Ganancias del Mes</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">$2,340</p>
                  <p className="text-sm text-gray-600">Comisiones</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">+15%</p>
                  <p className="text-sm text-gray-600">Crecimiento</p>
                </div>
              </div>
              <p className="text-gray-600">Análisis de rentabilidad y comisiones...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Report Generation Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3 text-2xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">
                  {reportTypes.find(r => r.id === selectedReportType)?.icon}
                </span>
              </div>
              <span>Generar {reportTypes.find(r => r.id === selectedReportType)?.name}</span>
            </DialogTitle>
            <DialogDescription className="text-base">
              Configura los parámetros del reporte antes de generarlo
            </DialogDescription>
          </DialogHeader>
          
          {!isGeneratingReport ? (
            <div className="space-y-8">
              {/* Report Configuration */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Configuración del Reporte</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox 
                      id="includeCharts" 
                      checked={reportConfig.includeCharts}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeCharts: checked as boolean }))
                      }
                    />
                    <div>
                      <Label htmlFor="includeCharts" className="font-medium">Incluir gráficos</Label>
                      <p className="text-sm text-gray-500">Agregar visualizaciones y charts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox 
                      id="includeDetails" 
                      checked={reportConfig.includeDetails}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeDetails: checked as boolean }))
                      }
                    />
                    <div>
                      <Label htmlFor="includeDetails" className="font-medium">Incluir detalles</Label>
                      <p className="text-sm text-gray-500">Mostrar información detallada</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox 
                      id="groupByDate" 
                      checked={reportConfig.groupByDate}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, groupByDate: checked as boolean }))
                      }
                    />
                    <div>
                      <Label htmlFor="groupByDate" className="font-medium">Agrupar por fecha</Label>
                      <p className="text-sm text-gray-500">Organizar datos cronológicamente</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <Checkbox 
                      id="includeComparisons" 
                      checked={reportConfig.includeComparisons}
                      onCheckedChange={(checked) => 
                        setReportConfig(prev => ({ ...prev, includeComparisons: checked as boolean }))
                      }
                    />
                    <div>
                      <Label htmlFor="includeComparisons" className="font-medium">Incluir comparaciones</Label>
                      <p className="text-sm text-gray-500">Comparar con períodos anteriores</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Configuration */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold">Configuración de Email</h3>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <Checkbox 
                    id="emailReport" 
                    checked={reportConfig.emailReport}
                    onCheckedChange={(checked) => 
                      setReportConfig(prev => ({ ...prev, emailReport: checked as boolean }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="emailReport" className="font-medium flex items-center space-x-2">
                      <span>Enviar por email</span>
                    </Label>
                    <p className="text-sm text-gray-500">Recibir el reporte en tu correo electrónico</p>
                  </div>
                </div>
                {reportConfig.emailReport && (
                  <div className="ml-8">
                    <Label htmlFor="reportEmail" className="text-sm font-medium">Dirección de email</Label>
                    <Input
                      id="reportEmail"
                      placeholder="correo@ejemplo.com"
                      value={reportConfig.reportEmail}
                      onChange={(e) => 
                        setReportConfig(prev => ({ ...prev, reportEmail: e.target.value }))
                      }
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Report Preview */}
              <div className="border rounded-xl p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold">Vista Previa del Reporte</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{reportTypes.find(r => r.id === selectedReportType)?.icon}</span>
                    <div>
                      <p className="font-medium">Tipo</p>
                      <p className="text-gray-600">{reportTypes.find(r => r.id === selectedReportType)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Período</p>
                      <p className="text-gray-600">{dateRange ? "Rango personalizado" : "Último mes"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Tiempo estimado</p>
                      <p className="text-gray-600">{reportTypes.find(r => r.id === selectedReportType)?.estimatedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Campos incluidos</p>
                      <p className="text-gray-600">{reportTypes.find(r => r.id === selectedReportType)?.fields.length} campos</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="text-xs text-gray-500 mb-2">Campos del reporte:</p>
                  <div className="flex flex-wrap gap-1">
                    {reportTypes.find(r => r.id === selectedReportType)?.fields.map((field, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setReportModalOpen(false)} size="lg">
                  Cancelar
                </Button>
                <Button 
                  onClick={() => generateReport(selectedReportType)} 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generar Reporte
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <span className="text-3xl">
                    {reportTypes.find(r => r.id === selectedReportType)?.icon}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Generando Reporte</h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Procesando datos y creando tu reporte personalizado...
                </p>
                <div className="max-w-md mx-auto">
                  <Progress value={reportProgress} className="h-4 mb-4" />
                  <p className="text-lg font-semibold text-blue-600">{Math.round(reportProgress)}% completado</p>
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <p className="text-gray-600">
                    Tiempo estimado restante: {Math.max(0, Math.round((100 - reportProgress) / 20))} segundos
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <p className="text-sm text-gray-500">No cierres esta ventana durante el proceso</p>
                </div>
              </div>

              {/* Processing Steps */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Conectando a la base de datos</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`h-4 w-4 ${reportProgress > 30 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={reportProgress > 30 ? 'text-gray-600' : 'text-gray-400'}>Extrayendo datos</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`h-4 w-4 ${reportProgress > 50 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={reportProgress > 50 ? 'text-gray-600' : 'text-gray-400'}>Procesando información</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`h-4 w-4 ${reportProgress > 70 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={reportProgress > 70 ? 'text-gray-600' : 'text-gray-400'}>Generando gráficos</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <CheckCircle className={`h-4 w-4 ${reportProgress > 85 ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={reportProgress > 85 ? 'text-gray-600' : 'text-gray-400'}>Aplicando formato</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
