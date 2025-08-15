"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MetricCard } from "@/components/ui/metric-card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Phone, Plus, RefreshCw, Ticket } from "lucide-react"
import type { UserRole } from "@/contexts/auth-context"

const myLines = [
  { sim: "8934071234567890123", msisdn: "+52 55 1234 5678", status: "Activa", plan: "Plan Básico 500MB" },
  { sim: "8934071234567890124", msisdn: "+52 55 1234 5679", status: "Activa", plan: "Plan Premium 2GB" },
  { sim: "8934071234567890125", msisdn: "+52 55 1234 5680", status: "Suspendida", plan: "Plan Básico 500MB" },
  { sim: "8934071234567890126", msisdn: "+52 55 1234 5681", status: "Activa", plan: "Plan Empresarial 5GB" },
]

const recentTransactions = [
  { id: "TXN101", type: "Activación", customer: "Juan Pérez", amount: "$25.00", date: "2024-01-15" },
  { id: "TXN102", type: "Recarga", customer: "María López", amount: "$15.00", date: "2024-01-15" },
  { id: "TXN103", type: "Activación", customer: "Carlos García", amount: "$30.00", date: "2024-01-14" },
  { id: "TXN104", type: "Recarga", customer: "Ana Martín", amount: "$20.00", date: "2024-01-14" },
  { id: "TXN105", type: "Activación", customer: "Luis Rodríguez", amount: "$25.00", date: "2024-01-13" },
]

interface OperatorDashboardProps {
  role: UserRole
}

export function OperatorDashboard({ role }: OperatorDashboardProps) {
  const roleLabels = {
    operator: "Operador",
    subdistributor: "Subdistribuidor",
    vendor: "Vendedor",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard {roleLabels[role]}</h1>
          <p className="text-gray-600">Panel personal de operaciones</p>
        </div>
        <div className="flex space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Activar Línea
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="SIMs en mi Almacén" value="156" change="-3" changeType="negative" icon={CreditCard} />
        <MetricCard title="Balance Actual" value="$2,450" change="+150" changeType="positive" icon={Wallet} />
        <MetricCard title="Líneas Asignadas" value="89" change="+5" changeType="positive" icon={Phone} />
        <MetricCard title="Tickets Abiertos" value="3" change="+1" changeType="negative" icon={Ticket} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center">
              <Plus className="h-6 w-6 mb-2" />
              Activar Línea
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
              <RefreshCw className="h-6 w-6 mb-2" />
              Realizar Recarga
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center bg-transparent">
              <Ticket className="h-6 w-6 mb-2" />
              Crear Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Lines */}
      <Card>
        <CardHeader>
          <CardTitle>Líneas Asignadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SIM</TableHead>
                <TableHead>MSISDN</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Plan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{line.sim}</TableCell>
                  <TableCell>{line.msisdn}</TableCell>
                  <TableCell>
                    <Badge variant={line.status === "Activa" ? "default" : "destructive"}>{line.status}</Badge>
                  </TableCell>
                  <TableCell>{line.plan}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas 5 Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">{transaction.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.type}</Badge>
                  </TableCell>
                  <TableCell>{transaction.customer}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
