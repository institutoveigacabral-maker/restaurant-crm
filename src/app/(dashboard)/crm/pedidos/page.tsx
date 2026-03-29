"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  UtensilsCrossed,
  DollarSign,
  Clock,
  ChefHat,
  CheckCircle,
  Wallet,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Order } from "@/types";
import { fetchOrders } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CardSkeleton } from "@/components/LoadingSkeleton";

type OrderStatus = Order["status"];

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  preparing: "served",
  served: "paid",
  paid: null,
  cancelled: null,
};

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    badgeClass: string;
    nextLabel: string | null;
    nextIcon: typeof ChefHat | null;
  }
> = {
  preparing: {
    label: "Preparando",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    nextLabel: "Servido",
    nextIcon: CheckCircle,
  },
  served: {
    label: "Servido",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
    nextLabel: "Pago",
    nextIcon: Wallet,
  },
  paid: {
    label: "Pago",
    badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
    nextLabel: null,
    nextIcon: null,
  },
  cancelled: {
    label: "Cancelado",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    nextLabel: null,
    nextIcon: null,
  },
};

function formatElapsed(dateStr: string): string {
  const orderDate = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const diffMs = now.getTime() - orderDate.getTime();

  if (diffMs < 0) return "hoje";

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d atras`;
  if (diffHours > 0) return `${diffHours}h atras`;
  if (diffMinutes > 0) return `${diffMinutes}min atras`;
  return "agora";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function CrmPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders()
      .then((data) => setOrders(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao atualizar status");
      }

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

      // Atualizar dialog se aberto
      setSelectedOrder((prev) =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
      );

      toast.success(`Pedido #${orderId} marcado como ${STATUS_CONFIG[newStatus].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar status");
    } finally {
      setUpdatingId(null);
      setConfirmCancel(null);
    }
  }, []);

  const handleCancel = useCallback(
    (orderId: string) => {
      if (confirmCancel === orderId) {
        updateStatus(orderId, "cancelled");
      } else {
        setConfirmCancel(orderId);
        // Reset confirmacao apos 3s
        setTimeout(() => setConfirmCancel((prev) => (prev === orderId ? null : prev)), 3000);
      }
    },
    [confirmCancel, updateStatus]
  );

  const statusLabel: Record<string, string> = {
    preparing: "Preparando",
    served: "Servido",
    paid: "Pago",
    cancelled: "Cancelado",
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = (o.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = filtered
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrders = orders.filter((o) => o.status === "preparing" || o.status === "served");

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-7 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  function renderStatusBadge(status: OrderStatus) {
    const config = STATUS_CONFIG[status];
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badgeClass}`}
      >
        {config.label}
      </span>
    );
  }

  function renderActionButtons(order: Order) {
    const isUpdating = updatingId === order.id;
    const nextStatus = STATUS_FLOW[order.status];
    const config = STATUS_CONFIG[order.status];
    const isCancelled = order.status === "cancelled";
    const isPaid = order.status === "paid";

    if (isCancelled || isPaid) return null;

    return (
      <div className="flex items-center gap-2 mt-3">
        {nextStatus && config.nextIcon && (
          <Button
            size="sm"
            variant="default"
            disabled={isUpdating}
            onClick={() => updateStatus(order.id, nextStatus)}
            className="flex-1"
          >
            {isUpdating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <config.nextIcon className="w-3.5 h-3.5 mr-1.5" />
            )}
            {config.nextLabel}
          </Button>
        )}
        <Button
          size="sm"
          variant={confirmCancel === order.id ? "destructive" : "outline"}
          disabled={isUpdating}
          onClick={() => handleCancel(order.id)}
          className="shrink-0"
        >
          <XCircle className="w-3.5 h-3.5 mr-1" />
          {confirmCancel === order.id ? "Confirmar" : "Cancelar"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">{orders.length} pedidos</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
                <p className="text-xs text-muted-foreground">Pedidos ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground">Receita total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  R${" "}
                  {orders.length
                    ? (
                        totalRevenue / orders.filter((o) => o.status !== "cancelled").length
                      ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                    : "0,00"}
                </p>
                <p className="text-xs text-muted-foreground">Ticket medio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="preparing">Preparando</SelectItem>
            <SelectItem value="served">Servido</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">Pedido #{order.id}</CardTitle>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                </div>
                {renderStatusBadge(order.status)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(order.date)}</span>
                <span className="text-muted-foreground/60">|</span>
                <span>{formatElapsed(order.date)}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 mb-3">
                {order.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">
                      R${" "}
                      {(item.price * item.quantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="text-xs text-muted-foreground">+{order.items.length - 3} itens</p>
                )}
              </div>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">
                  R$ {order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Detalhes
                </Button>
              </div>
              {renderActionButtons(order)}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">Nenhum pedido encontrado.</div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedido #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                {renderStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo</p>
                  <p className="font-medium">{formatElapsed(selectedOrder.date)}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Itens</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between p-2.5 bg-muted/50 rounded-lg">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">
                      R${" "}
                      {(item.price * item.quantity).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-primary">
                  R$ {selectedOrder.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              {renderActionButtons(selectedOrder)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
