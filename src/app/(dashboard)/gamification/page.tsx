"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Trophy, Star, Flame, Zap, BookOpen, Users, Target, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  fetchGamificationProfile,
  fetchLeaderboard,
  fetchBadges,
  fetchChallenges,
  joinChallenge,
} from "@/lib/api";

// ── Interfaces ──────────────────────────────────────────────

interface GamificationProfile {
  profile: {
    userId: number;
    level: number;
    totalXp: number;
    streak: number;
    coursesCompleted: number;
  };
}

interface LeaderboardEntry {
  userId: number;
  userName: string;
  level: number;
  totalXp: number;
  badgeCount: number;
}

interface UserBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned: boolean;
  earnedAt: string | null;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  joined: boolean;
  progress: number;
}

// ── Constants ───────────────────────────────────────────────

const emojiMap: Record<string, string> = {
  star: "\u2B50",
  flame: "\uD83D\uDD25",
  trophy: "\uD83C\uDFC6",
  book: "\uD83D\uDCDA",
  target: "\uD83C\uDFAF",
  shield: "\uD83D\uDEE1\uFE0F",
  zap: "\u26A1",
  award: "\uD83C\uDFC5",
};

const rarityColor: Record<string, string> = {
  common: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  epic: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  legendary: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

const rarityLabel: Record<string, string> = {
  common: "Comum",
  rare: "Raro",
  epic: "\u00C9pico",
  legendary: "Lend\u00E1rio",
};

const challengeTypeLabel: Record<string, string> = {
  individual: "Individual",
  team: "Equipe",
  weekly: "Semanal",
  monthly: "Mensal",
};

// ── Helper ──────────────────────────────────────────────────

function timeRemaining(endDate: string): string {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Encerrado";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h restantes`;
  return `${hours}h restantes`;
}

// ── Main Page ───────────────────────────────────────────────

export default function GamificationPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<GamificationProfile["profile"] | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileData, leaderboardData, badgesData, challengesData] = await Promise.all([
          fetchGamificationProfile(),
          fetchLeaderboard(20),
          fetchBadges(),
          fetchChallenges(),
        ]);
        const gp = profileData as unknown as GamificationProfile;
        setProfile(gp.profile);
        setLeaderboard(leaderboardData as unknown as LeaderboardEntry[]);
        setBadges(badgesData as unknown as UserBadge[]);
        const cd = challengesData as unknown as { challenges: Challenge[] } | Challenge[];
        setChallenges(Array.isArray(cd) ? cd : (cd.challenges ?? []));
      } catch (err) {
        if (err instanceof Error) toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleJoinChallenge = async (challengeId: number) => {
    setJoiningId(challengeId);
    try {
      await joinChallenge(challengeId);
      setChallenges((prev) => prev.map((c) => (c.id === challengeId ? { ...c, joined: true } : c)));
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const level = profile?.level ?? 1;
  const totalXp = profile?.totalXp ?? 0;
  const nextLevelXp = level * 500;
  const xpProgress = Math.min(100, (totalXp / nextLevelXp) * 100);
  const currentUserId = (session?.user as Record<string, unknown> | undefined)?.id as
    | number
    | undefined;

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho do perfil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Gamificação
          </h1>
          <p className="text-muted-foreground">
            Conquiste pontos, suba de nível e desbloqueie conquistas
          </p>
        </div>
      </div>

      {/* Cards de resumo do perfil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nível</p>
                <p className="text-xl font-bold">{level}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">XP Total</p>
                <p className="text-xl font-bold">{totalXp}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/10 p-2 rounded-lg">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sequência</p>
                <p className="text-xl font-bold">{profile?.streak ?? 0} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <BookOpen className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cursos Concluídos</p>
                <p className="text-xl font-bold">{profile?.coursesCompleted ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progresso XP */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso para Nível {level + 1}</span>
            <span className="font-medium">
              {totalXp} / {nextLevelXp} XP
            </span>
          </div>
          <Progress value={xpProgress} className="h-3" />
        </CardContent>
      </Card>

      <Separator />

      {/* Abas */}
      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ranking" className="gap-1.5">
            <Users className="w-4 h-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="conquistas" className="gap-1.5">
            <Trophy className="w-4 h-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="desafios" className="gap-1.5">
            <Target className="w-4 h-4" />
            Desafios
          </TabsTrigger>
        </TabsList>

        {/* ── Aba Ranking ─────────────────────────────────── */}
        <TabsContent value="ranking" className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum dado de ranking disponível</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const position = index + 1;
                const isCurrentUser = currentUserId != null && entry.userId === currentUserId;
                return (
                  <Card key={entry.userId} className={isCurrentUser ? "ring-2 ring-primary" : ""}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold text-sm shrink-0">
                        {position <= 3 ? (
                          <span className="text-lg">
                            {position === 1
                              ? "\uD83E\uDD47"
                              : position === 2
                                ? "\uD83E\uDD48"
                                : "\uD83E\uDD49"}
                          </span>
                        ) : (
                          <span>#{position}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {entry.userName}
                          {isCurrentUser && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Você
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nível {entry.level} · {entry.badgeCount} conquistas
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{entry.totalXp} XP</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Aba Conquistas ──────────────────────────────── */}
        <TabsContent value="conquistas" className="space-y-4">
          {badges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhuma conquista disponível</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card
                  key={badge.id}
                  className={
                    badge.earned ? "ring-2 ring-amber-400 dark:ring-amber-500" : "opacity-50"
                  }
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{emojiMap[badge.icon] ?? "\uD83C\uDFC5"}</span>
                      <Badge
                        className={`text-xs ${rarityColor[badge.rarity] ?? rarityColor.common}`}
                      >
                        {rarityLabel[badge.rarity] ?? badge.rarity}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                    {badge.earned && badge.earnedAt && (
                      <p className="text-xs text-muted-foreground">
                        Conquistado em {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Aba Desafios ───────────────────────────────── */}
        <TabsContent value="desafios" className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Nenhum desafio ativo no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-sm">{challenge.title}</h3>
                        <p className="text-xs text-muted-foreground">{challenge.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {challengeTypeLabel[challenge.type] ?? challenge.type}
                        </Badge>
                        <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          <Zap className="w-3 h-3 mr-1" />
                          {challenge.xpReward} XP
                        </Badge>
                      </div>
                    </div>

                    {challenge.joined && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progresso</span>
                          <span>
                            {challenge.progress} / {challenge.targetValue}
                          </span>
                        </div>
                        <Progress
                          value={
                            challenge.targetValue > 0
                              ? (challenge.progress / challenge.targetValue) * 100
                              : 0
                          }
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {timeRemaining(challenge.endDate)}
                      </span>
                      {!challenge.joined ? (
                        <Button
                          size="sm"
                          onClick={() => handleJoinChallenge(challenge.id)}
                          disabled={joiningId === challenge.id}
                        >
                          {joiningId === challenge.id && (
                            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          )}
                          Participar
                        </Button>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600 border-green-600"
                        >
                          Participando
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
