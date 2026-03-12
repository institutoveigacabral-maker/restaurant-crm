"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchSettings, updateSettings } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";

interface SettingsData {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  timezone: string;
  currency: string;
  maxReservationsPerSlot: number;
  reservationDuration: number;
  autoConfirmReservations: boolean;
  emailNotifications: boolean;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsData>({
    id: 0,
    name: "",
    phone: "",
    email: "",
    address: "",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    maxReservationsPerSlot: 10,
    reservationDuration: 120,
    autoConfirmReservations: false,
    emailNotifications: true,
  });

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchSettings();
      setForm({
        id: (data.id as number) ?? 0,
        name: (data.name as string) ?? "",
        phone: (data.phone as string) ?? "",
        email: (data.email as string) ?? "",
        address: (data.address as string) ?? "",
        timezone: (data.timezone as string) ?? "America/Sao_Paulo",
        currency: (data.currency as string) ?? "BRL",
        maxReservationsPerSlot: (data.max_reservations_per_slot as number) ?? 10,
        reservationDuration: (data.reservation_duration_minutes as number) ?? 120,
        autoConfirmReservations: (data.auto_confirm_reservations as boolean) ?? false,
        emailNotifications: (data.email_notifications as boolean) ?? true,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function handleChange(field: keyof SettingsData, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings({
        id: form.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        address: form.address,
        timezone: form.timezone,
        currency: form.currency,
        maxReservationsPerSlot: form.maxReservationsPerSlot,
        reservationDuration: form.reservationDuration,
        autoConfirmReservations: form.autoConfirmReservations,
        emailNotifications: form.emailNotifications,
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Configurações do Restaurante</h1>
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Configurações do Restaurante</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Restaurante</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Fuso Horário</Label>
                <Input
                  id="timezone"
                  value={form.timezone}
                  onChange={(e) => handleChange("timezone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Input
                  id="currency"
                  value={form.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxReservations">Máximo de Reservas por Horário</Label>
                <Input
                  id="maxReservations"
                  type="number"
                  min={1}
                  value={form.maxReservationsPerSlot}
                  onChange={(e) => handleChange("maxReservationsPerSlot", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duração da Reserva (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  step={15}
                  value={form.reservationDuration}
                  onChange={(e) => handleChange("reservationDuration", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="autoConfirm"
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={form.autoConfirmReservations}
                onChange={(e) => handleChange("autoConfirmReservations", e.target.checked)}
              />
              <Label htmlFor="autoConfirm">Confirmar reservas automaticamente</Label>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <input
                id="emailNotifications"
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={form.emailNotifications}
                onChange={(e) => handleChange("emailNotifications", e.target.checked)}
              />
              <Label htmlFor="emailNotifications">Enviar notificações por email</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
