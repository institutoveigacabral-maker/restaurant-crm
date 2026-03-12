"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import { fetchCustomerProfile } from "@/lib/api";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  visits: number;
  total_spent: string;
  last_visit: string | null;
  notes: string;
  tags: string[];
  created_at: string;
}

interface ReservationData {
  id: number;
  customer_id: number;
  customer_name: string;
  date: string;
  time: string;
  guests: number;
  table_name: string;
  status: string;
  notes: string;
}

interface OrderData {
  id: number;
  customer_id: number;
  customer_name: string;
  items: unknown;
  total: string;
  date: string;
  status: string;
}

const reservationStatusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const orderStatusColors: Record<string, string> = {
  preparing: "bg-yellow-100 text-yellow-800",
  served: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const reservationStatusLabels: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  cancelled: "Cancelada",
  completed: "Concluída",
};

const orderStatusLabels: Record<string, string> = {
  preparing: "Preparando",
  served: "Servido",
  paid: "Pago",
  cancelled: "Cancelado",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-6 w-48 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 bg-gray-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-7 w-56 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-4 w-36 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function CustomerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [customerReservations, setCustomerReservations] = useState<ReservationData[]>([]);
  const [customerOrders, setCustomerOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchCustomerProfile(id)
      .then((data) => {
        setCustomer(data.customer as unknown as CustomerData);
        setCustomerReservations((data.reservations ?? []) as unknown as ReservationData[]);
        setCustomerOrders((data.orders ?? []) as unknown as OrderData[]);
      })
      .catch((err: Error) => {
        toast.error(err.message || "Erro ao carregar perfil do cliente");
        router.push("/customers");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <LoadingSkeleton />;
  if (!customer) return null;

  const totalSpent = Number(customer.total_spent ?? 0);
  const avgTicket = customer.visits > 0 ? totalSpent / customer.visits : 0;
  const daysSinceLastVisit = daysSince(customer.last_visit);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Link href="/customers">
        <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          Voltar para clientes
        </Button>
      </Link>

      {/* Customer Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-20 w-20 text-2xl">
              <AvatarFallback className="bg-orange-100 text-orange-700 text-2xl font-semibold">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </span>
              </div>
              {customer.tags && customer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {customer.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {customer.notes && (
                <p className="text-sm text-gray-500 italic pt-1">{customer.notes}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              <span>Cliente desde {formatDate(customer.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-gray-900">{customer.visits ?? 0}</p>
            <p className="text-xs text-gray-500">Total de visitas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-gray-500">Total gasto</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgTicket)}</p>
            <p className="text-xs text-gray-500">Ticket médio</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">
              {daysSinceLastVisit !== null ? daysSinceLastVisit : "-"}
            </p>
            <p className="text-xs text-gray-500">Dias desde última visita</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reservations" className="w-full">
        <TabsList>
          <TabsTrigger value="reservations">Histórico de Reservas</TabsTrigger>
          <TabsTrigger value="orders">Histórico de Pedidos</TabsTrigger>
        </TabsList>

        {/* Reservations Tab */}
        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Reservas</h3>
            </CardHeader>
            <CardContent>
              {customerReservations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma reserva encontrada para este cliente.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Horário</TableHead>
                      <TableHead>Pessoas</TableHead>
                      <TableHead>Mesa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerReservations.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{formatDate(r.date)}</TableCell>
                        <TableCell>{r.time}</TableCell>
                        <TableCell>{r.guests}</TableCell>
                        <TableCell>{r.table_name}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              reservationStatusColors[r.status] ?? "bg-gray-100 text-gray-800"
                            }
                          >
                            {reservationStatusLabels[r.status] ?? r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-gray-500">
                          {r.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Pedidos</h3>
            </CardHeader>
            <CardContent>
              {customerOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  <p>Nenhum pedido encontrado para este cliente.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Itens</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((o) => {
                      const items = typeof o.items === "string" ? JSON.parse(o.items) : o.items;
                      const itemCount = Array.isArray(items) ? items.length : 0;

                      return (
                        <TableRow key={o.id}>
                          <TableCell>{formatDate(o.date)}</TableCell>
                          <TableCell>{itemCount} item(ns)</TableCell>
                          <TableCell>{formatCurrency(Number(o.total))}</TableCell>
                          <TableCell>
                            <Badge
                              className={orderStatusColors[o.status] ?? "bg-gray-100 text-gray-800"}
                            >
                              {orderStatusLabels[o.status] ?? o.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
