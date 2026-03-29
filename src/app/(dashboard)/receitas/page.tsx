"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Heart,
  Plus,
  Trophy,
  Users,
  TrendingUp,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LoyaltyProgram {
  id: number;
  name: string;
  type: string;
  rules: { pointsPerEuro?: number; tiers?: { name: string; minPoints: number }[] };
  active: boolean;
}

interface BalanceEntry {
  id: number;
  customerId: number;
  customerName: string;
  points: number | null;
  tier: string | null;
  updatedAt: string | null;
}

interface Transaction {
  id: number;
  type: string;
  points: number;
  description: string | null;
  createdAt: string | null;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Erro na requisicao");
  }
  return json.data;
}

export default function ReceitasPage() {
  const [program, setProgram] = useState<LoyaltyProgram | null>(null);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Create program dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("Programa de Fidelidade");
  const [createPointsPerEuro, setCreatePointsPerEuro] = useState("1");
  const [creating, setCreating] = useState(false);

  // Earn points dialog
  const [earnDialog, setEarnDialog] = useState<{ customerId: number; customerName: string } | null>(
    null
  );
  const [earnPoints, setEarnPoints] = useState("");
  const [earnDescription, setEarnDescription] = useState("");
  const [earning, setEarning] = useState(false);

  // Customer transactions dialog
  const [txDialog, setTxDialog] = useState<{
    customerId: number;
    customerName: string;
    balance: number;
  } | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const prog = await apiFetch<LoyaltyProgram>("/api/loyalty");
      setProgram(prog);

      if (prog) {
        const bals = await apiFetch<BalanceEntry[]>("/api/loyalty/balances");
        setBalances(bals ?? []);
      }
    } catch {
      // No program yet — expected
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreateProgram() {
    setCreating(true);
    try {
      await apiFetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          type: "points",
          rules: {
            pointsPerEuro: parseFloat(createPointsPerEuro) || 1,
            tiers: [
              { name: "Bronze", minPoints: 0 },
              { name: "Prata", minPoints: 500 },
              { name: "Ouro", minPoints: 1500 },
              { name: "Platina", minPoints: 5000 },
            ],
          },
        }),
      });
      toast.success("Programa criado");
      setShowCreate(false);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar programa");
    } finally {
      setCreating(false);
    }
  }

  async function handleEarnPoints() {
    if (!earnDialog) return;
    setEarning(true);
    try {
      await apiFetch(`/api/loyalty/${earnDialog.customerId}/earn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          points: parseInt(earnPoints, 10),
          description: earnDescription || undefined,
        }),
      });
      toast.success(`${earnPoints} pontos adicionados a ${earnDialog.customerName}`);
      setEarnDialog(null);
      setEarnPoints("");
      setEarnDescription("");
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao adicionar pontos");
    } finally {
      setEarning(false);
    }
  }

  async function handleViewTransactions(entry: BalanceEntry) {
    setTxDialog({
      customerId: entry.customerId,
      customerName: entry.customerName,
      balance: entry.points ?? 0,
    });
    setLoadingTx(true);
    try {
      const data = await apiFetch<{ balance: unknown; transactions: Transaction[] }>(
        `/api/loyalty/${entry.customerId}`
      );
      setTransactions(data?.transactions ?? []);
    } catch {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }

  const totalPoints = balances.reduce((sum, b) => sum + (b.points ?? 0), 0);
  const avgPoints = balances.length > 0 ? Math.round(totalPoints / balances.length) : 0;

  function getTierForPoints(points: number): string {
    if (!program?.rules?.tiers?.length) return "-";
    const sorted = [...program.rules.tiers].sort((a, b) => b.minPoints - a.minPoints);
    for (const tier of sorted) {
      if (points >= tier.minPoints) return tier.name;
    }
    return sorted[sorted.length - 1]?.name ?? "-";
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fidelidade</h1>
          <p className="text-muted-foreground">Programa de pontos por visita e consumo</p>
        </div>
        {program && (
          <Button
            variant="outline"
            onClick={() => {
              /* TODO: edit program */
            }}
          >
            Configurar Programa
          </Button>
        )}
      </div>

      {/* No program — CTA */}
      {!program && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <div className="bg-pink-500/10 p-4 rounded-2xl">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h2 className="text-lg font-semibold">Nenhum programa de fidelidade ativo</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Crie um programa de pontos para recompensar clientes fieis. Defina regras de pontuacao
              e niveis de recompensa.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Criar Programa de Fidelidade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Program active */}
      {program && (
        <>
          {/* Program card + stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-600" />
                  {program.name}
                </CardTitle>
                <CardDescription>
                  {program.rules?.pointsPerEuro ?? 1} ponto(s) por EUR gasto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {program.rules?.tiers?.map((tier) => (
                    <Badge key={tier.name} variant="secondary">
                      {tier.name} ({tier.minPoints}+)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2.5 rounded-xl">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes no programa</p>
                    <p className="text-2xl font-bold">{balances.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2.5 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total pontos distribuidos</p>
                    <p className="text-2xl font-bold">{totalPoints.toLocaleString("pt-PT")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-2.5 rounded-xl">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Media de pontos</p>
                    <p className="text-2xl font-bold">{avgPoints.toLocaleString("pt-PT")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ranking */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Ranking de Clientes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {balances.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum cliente no programa ainda. Adicione pontos ao primeiro cliente.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Pontos</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.slice(0, 10).map((entry, i) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                        <TableCell>
                          <button
                            className="font-medium hover:underline text-left"
                            onClick={() => handleViewTransactions(entry)}
                          >
                            {entry.customerName}
                          </button>
                        </TableCell>
                        <TableCell className="font-mono">
                          {(entry.points ?? 0).toLocaleString("pt-PT")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getTierForPoints(entry.points ?? 0)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setEarnDialog({
                                customerId: entry.customerId,
                                customerName: entry.customerName,
                              })
                            }
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Pontos
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog: Create Program */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Programa de Fidelidade</DialogTitle>
            <DialogDescription>
              Configure o nome e as regras de pontuacao do programa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prog-name">Nome do programa</Label>
              <Input
                id="prog-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Programa de Fidelidade"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prog-points">Pontos por EUR gasto</Label>
              <Input
                id="prog-points"
                type="number"
                min="0.1"
                step="0.1"
                value={createPointsPerEuro}
                onChange={(e) => setCreatePointsPerEuro(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Niveis padrao: Bronze (0), Prata (500), Ouro (1500), Platina (5000)
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateProgram} disabled={creating || !createName.trim()}>
              {creating ? "Criando..." : "Criar Programa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Earn Points */}
      <Dialog open={!!earnDialog} onOpenChange={(open) => !open && setEarnDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Pontos</DialogTitle>
            <DialogDescription>{earnDialog?.customerName ?? "Cliente"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="earn-pts">Pontos</Label>
              <Input
                id="earn-pts"
                type="number"
                min="1"
                value={earnPoints}
                onChange={(e) => setEarnPoints(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="earn-desc">Descricao (opcional)</Label>
              <Input
                id="earn-desc"
                value={earnDescription}
                onChange={(e) => setEarnDescription(e.target.value)}
                placeholder="Jantar 25/03"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEarnDialog(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEarnPoints}
              disabled={earning || !earnPoints || parseInt(earnPoints, 10) <= 0}
            >
              {earning ? "Adicionando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Customer Transactions */}
      <Dialog open={!!txDialog} onOpenChange={(open) => !open && setTxDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{txDialog?.customerName}</DialogTitle>
            <DialogDescription>
              Saldo: {(txDialog?.balance ?? 0).toLocaleString("pt-PT")} pontos
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto">
            {loadingTx ? (
              <div className="text-center py-4 text-muted-foreground">Carregando...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">Sem transacoes</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pontos</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {tx.type === "earn" ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <ArrowUpRight className="w-3 h-3" /> Ganho
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <ArrowDownRight className="w-3 h-3" /> Resgate
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {tx.type === "earn" ? "+" : "-"}
                        {tx.points}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {tx.createdAt
                          ? new Date(tx.createdAt).toLocaleDateString("pt-PT", {
                              day: "2-digit",
                              month: "2-digit",
                            })
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTxDialog(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
