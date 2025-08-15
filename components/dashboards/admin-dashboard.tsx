"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CreditCard, Wallet, TrendingUp, Users, ArrowUpRight } from "lucide-react"
import type { UserRole } from "@/contexts/auth-context"

const rechargeData = [
  { month: "Ene", recargas: 120, activaciones: 85 },
  { month: "Feb", recargas: 135, activaciones: 92 },
  { month: "Mar", recargas: 148, activaciones: 78 },
  { month: "Abr", recargas: 162, activaciones: 105 },
  { month: "May", recargas: 155, activaciones: 98 },
  { month: "Jun", recargas: 178, activaciones: 112 },
]

const subordinateActivity = [
  { name: "Pedro Sánchez", role: "Operador", lastActivity: "Hace 2 min", transactions: 15 },
  { name: "Laura Díaz", role: "Vendedor", lastActivity: "Hace 5 min", transactions: 8 },
  { name: "Miguel Torres", role: "Operador", lastActivity: "Hace 12 min", transactions: 23 },
  { name: "Carmen Ruiz", role: "Vendedor", lastActivity: "Hace 18 min", transactions: 12 },
]

interface AdminDashboardProps {
  role: UserRole
}

export function AdminDashboard({ role }: AdminDashboardProps) {
  const isGerente = role === "gerente"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard {isGerente ? "Gerente" : "Administrador"}</h1>
          <p className="text-gray-600">Gestión de operaciones y subordinados</p>
        </div>
        <Button>
          <ArrowUpRight className="mr-2 h-4 w-4" />
          Transferir Balance
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="SIMs en Circulación" value="3,247" change="+5%" changeType="positive" icon={CreditCard} />
        <MetricCard title="Balance Disponible" value="$12,450" change="+8%" changeType="positive" icon={Wallet} />
        <MetricCard title="Ingresos Mensuales" value="$8,231" change="+12%" changeType="positive" icon={TrendingUp} />
        <MetricCard title="Subordinados Activos" value="24" change="+2" changeType="positive" icon={Users} />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recargas vs Activaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Recargas vs Activaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rechargeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="recargas" fill="#3b82f6" name="Recargas" />
                <Bar dataKey="activaciones" fill="#10b981" name="Activaciones" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subordinate Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad de Subordinados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead>Transacciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subordinateActivity.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{user.lastActivity}</TableCell>
                    <TableCell>{user.transactions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Warehouse View */}
      <Card>
        <CardHeader>
          <CardTitle>Vista de Almacén - SIMs Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600">Disponibles</h3>
              <p className="text-2xl font-bold">1,247</p>
              <p className="text-sm text-gray-600">SIMs sin asignar</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600">Asignadas</h3>
              <p className="text-2xl font-bold">2,000</p>
              <p className="text-sm text-gray-600">SIMs en uso</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-yellow-600">Reservadas</h3>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-gray-600">SIMs reservadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
