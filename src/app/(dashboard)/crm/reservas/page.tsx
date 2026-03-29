"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Users as UsersIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Customer, Reservation } from "@/types";
import ReservationModal from "@/components/ReservationModal";
import { TableSkeleton } from "@/components/LoadingSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchCustomers,
  fetchReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from "@/lib/api";

const statusLabel: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendente",
  cancelled: "Cancelada",
  completed: "Concluida",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  pending: "outline",
  cancelled: "destructive",
  completed: "secondary",
};

function ReservationTable({
  data,
  onStatusChange,
  onEdit,
  onDelete,
}: {
  data: Reservation[];
  onStatusChange: (id: string, status: Reservation["status"]) => void;
  onEdit: (r: Reservation) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Horario</TableHead>
          <TableHead>Pessoas</TableHead>
          <TableHead>Mesa</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[80px]">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              Nenhuma reserva encontrada
            </TableCell>
          </TableRow>
        )}
        {data.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div>
                <p className="font-medium">{r.customerName}</p>
                {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 text-sm">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                {r.date}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                {r.time}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5 text-sm">
                <UsersIcon className="w-3.5 h-3.5 text-muted-foreground" />
                {r.guests}
              </div>
            </TableCell>
            <TableCell className="text-sm">{r.table}</TableCell>
            <TableCell>
              <Select
                value={r.status}
                onValueChange={(v) => onStatusChange(r.id, v as Reservation["status"])}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <Badge variant={statusVariant[r.status]}>{statusLabel[r.status]}</Badge>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabel).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(r)}>
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onDelete(r.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const HOURS = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
];

function WeekCalendar({
  reservations,
  onEdit,
}: {
  reservations: Reservation[];
  onEdit: (r: Reservation) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1 + weekOffset * 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
  const todayStr = new Date().toISOString().split("T")[0];

  function getReservationsForSlot(date: Date, hour: string) {
    const dateStr = date.toISOString().split("T")[0];
    return reservations.filter((r) => r.date === dateStr && r.time === hour);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium">
          {days[0].toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })} —{" "}
          {days[6].toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
        <div className="flex gap-1">
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              Hoje
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(weekOffset + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header */}
          <div className="grid grid-cols-8 gap-px bg-border rounded-t-lg overflow-hidden">
            <div className="bg-muted p-2 text-xs font-medium text-muted-foreground">Horario</div>
            {days.map((d, i) => {
              const isToday = d.toISOString().split("T")[0] === todayStr;
              return (
                <div
                  key={i}
                  className={`p-2 text-center text-xs font-medium ${isToday ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  <div>{dayNames[i]}</div>
                  <div className="text-lg font-bold">{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-px bg-border">
              <div className="bg-card p-2 text-xs text-muted-foreground font-mono">{hour}</div>
              {days.map((d, i) => {
                const slots = getReservationsForSlot(d, hour);
                return (
                  <div key={i} className="bg-card p-1 min-h-[40px]">
                    {slots.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onEdit(r)}
                        className={`w-full text-left text-xs p-1 rounded mb-0.5 truncate cursor-pointer ${
                          r.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : r.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : r.status === "cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {r.customerName} ({r.guests}p)
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-200" /> Confirmada
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-200" /> Pendente
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-200" /> Cancelada
        </span>
      </div>
    </div>
  );
}

export default function CrmReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  const load = () => {
    Promise.all([fetchReservations(), fetchCustomers()])
      .then(([r, c]) => {
        setReservations(r);
        setCustomers(c);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = reservations.filter((r) => {
    const matchesSearch = (r.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesDate = !filterDate || r.date === filterDate;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const today = new Date().toISOString().split("T")[0];
  const todayReservations = reservations.filter((r) => r.date === today);
  const upcomingReservations = reservations.filter((r) => r.date > today);

  const handleSave = async (data: Omit<Reservation, "id">) => {
    try {
      if (editingReservation) {
        await updateReservation({ ...data, id: editingReservation.id });
      } else {
        await createReservation(data);
      }
      setModalOpen(false);
      setEditingReservation(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta reserva?")) {
      try {
        await deleteReservation(id);
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao excluir");
      }
    }
  };

  const handleStatusChange = async (id: string, status: Reservation["status"]) => {
    try {
      const r = reservations.find((r) => r.id === id);
      if (r) {
        await updateReservation({ ...r, status });
        load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-7 w-32 bg-muted rounded animate-pulse mb-6" />
        <TableSkeleton />
      </div>
    );
  }

  const handleEdit = (r: Reservation) => {
    setEditingReservation(r);
    setModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">{reservations.length} reservas total</p>
        </div>
        <Button
          onClick={() => {
            setEditingReservation(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayReservations.length}</p>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingReservations.length}</p>
                <p className="text-xs text-muted-foreground">Proximas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <UsersIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {todayReservations.reduce((sum, r) => sum + r.guests, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Pessoas hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="today">Hoje ({todayReservations.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Proximas ({upcomingReservations.length})</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <div className="flex gap-3 mt-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-[180px]"
          />
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="confirmed">Confirmada</SelectItem>
              <SelectItem value="completed">Concluida</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ReservationTable
                data={filtered}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ReservationTable
                data={todayReservations}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ReservationTable
                data={upcomingReservations}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <WeekCalendar reservations={reservations} onEdit={handleEdit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {modalOpen && (
        <ReservationModal
          reservation={editingReservation}
          customers={customers}
          onClose={() => {
            setModalOpen(false);
            setEditingReservation(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
