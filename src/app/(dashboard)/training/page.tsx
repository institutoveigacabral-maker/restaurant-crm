"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Clock,
  Star,
  Lock,
  CheckCircle2,
  BookOpen,
  Flame,
  Zap,
  Plus,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StatSkeleton } from "@/components/LoadingSkeleton";
import {
  fetchCourses,
  fetchEnrollments,
  fetchGamificationProfile,
  enrollInCourse,
  createCourseApi,
} from "@/lib/api";

// ── Interfaces ──────────────────────────────────────────────

interface Course {
  id: number;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  pillbitsUrl: string | null;
  durationMinutes: number;
  xpReward: number;
  requiredLevel: number;
  mandatory: boolean;
  active: boolean;
}

interface Enrollment {
  enrollment: {
    id: number;
    courseId: number;
    status: string;
    progress: number;
    score: number | null;
    completedAt: string | null;
  };
  course: Course;
}

interface GamificationProfile {
  profile: {
    level: number;
    totalXp: number;
    streak: number;
    coursesCompleted: number;
  };
}

// ── Constants ───────────────────────────────────────────────

const CATEGORIES = [
  { value: "todos", label: "Todos" },
  { value: "atendimento", label: "Atendimento" },
  { value: "cozinha", label: "Cozinha" },
  { value: "higiene", label: "Higiene" },
  { value: "gestao", label: "Gestão" },
  { value: "bebidas", label: "Bebidas" },
];

const DIFFICULTIES = [
  { value: "todos", label: "Todos" },
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
];

const categoryColor: Record<string, string> = {
  atendimento: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  cozinha: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  higiene: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  gestao: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  bebidas: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const difficultyColor: Record<string, string> = {
  iniciante: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediario: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  avancado: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const difficultyLabel: Record<string, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

// ── Helper Components ───────────────────────────────────────

function CourseCardSkeleton() {
  return (
    <div className="bg-card border rounded-xl p-5 animate-pulse space-y-3">
      <div className="h-5 w-20 bg-muted rounded" />
      <div className="h-5 w-3/4 bg-muted rounded" />
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-2/3 bg-muted rounded" />
      <div className="flex gap-2 mt-2">
        <div className="h-4 w-16 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
      <div className="h-9 w-full bg-muted rounded mt-2" />
    </div>
  );
}

function CourseCard({
  course,
  enrollment,
  userLevel,
  onEnroll,
}: {
  course: Course;
  enrollment: Enrollment["enrollment"] | null;
  userLevel: number;
  onEnroll: (courseId: number) => void;
}) {
  const isLocked = userLevel < course.requiredLevel;
  const status = enrollment?.status;

  return (
    <Card className={isLocked ? "opacity-60" : ""}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[course.category] ?? "bg-muted text-muted-foreground"}`}
          >
            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
          </span>
          {course.mandatory && (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="w-3 h-3 mr-1" />
              Obrigatório
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-sm leading-tight">{course.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {course.description || "Sem descrição disponível"}
        </p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.durationMinutes} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            {course.xpReward} XP
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor[course.difficulty] ?? "bg-muted"}`}
          >
            {difficultyLabel[course.difficulty] ?? course.difficulty}
          </span>
        </div>

        {isLocked && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            Requer nível {course.requiredLevel}
          </div>
        )}

        {!isLocked && status === "completed" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              Concluído
              {enrollment?.score != null && ` · Nota: ${enrollment.score}`}
            </div>
            <Progress value={100} />
          </div>
        )}

        {!isLocked && status === "in_progress" && enrollment && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{enrollment.progress}%</span>
            </div>
            <Progress value={enrollment.progress} />
            <a href={`/training/${course.id}`}>
              <Button size="sm" className="w-full">
                Continuar
              </Button>
            </a>
          </div>
        )}

        {!isLocked && status === "enrolled" && (
          <a href={`/training/${course.id}`}>
            <Button size="sm" className="w-full">
              Começar
            </Button>
          </a>
        )}

        {!isLocked && !status && (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => onEnroll(course.id)}
          >
            Começar
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ───────────────────────────────────────────────

export default function TrainingPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profile, setProfile] = useState<GamificationProfile["profile"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("todos");
  const [difficulty, setDifficulty] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "atendimento",
    difficulty: "iniciante",
    pillbitsUrl: "",
    durationMinutes: 5,
    xpReward: 50,
    requiredLevel: 1,
    mandatory: false,
  });

  const role = session?.user?.role as string | undefined;
  const isAdmin = role === "admin" || role === "gerente";

  const loadData = useCallback(async () => {
    try {
      const catParam = category === "todos" ? undefined : category;
      const diffParam = difficulty === "todos" ? undefined : difficulty;
      const [coursesData, enrollmentsData, profileData] = await Promise.all([
        fetchCourses(catParam, diffParam),
        fetchEnrollments(),
        fetchGamificationProfile(),
      ]);
      setCourses(coursesData as unknown as Course[]);
      setEnrollments(enrollmentsData as unknown as Enrollment[]);
      const gp = profileData as unknown as GamificationProfile;
      setProfile(gp.profile);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, difficulty]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async (courseId: number) => {
    try {
      await enrollInCourse(courseId);
      await loadData();
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await createCourseApi({
        ...newCourse,
        pillbitsUrl: newCourse.pillbitsUrl || undefined,
      });
      setDialogOpen(false);
      setNewCourse({
        title: "",
        description: "",
        category: "atendimento",
        difficulty: "iniciante",
        pillbitsUrl: "",
        durationMinutes: 5,
        xpReward: 50,
        requiredLevel: 1,
        mandatory: false,
      });
      await loadData();
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    }
  };

  const enrollmentMap = new Map<number, Enrollment["enrollment"]>();
  for (const e of enrollments) {
    if (e.enrollment) enrollmentMap.set(e.enrollment.courseId, e.enrollment);
  }

  const completedCount = enrollments.filter((e) => e.enrollment?.status === "completed").length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Treinamento
          </h1>
          <p className="text-muted-foreground">Desenvolva suas habilidades</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Curso
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cursos Disponíveis</p>
                <p className="text-xl font-bold">{courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concluídos</p>
                <p className="text-xl font-bold">{completedCount}</p>
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
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">XP Total</p>
                <p className="text-xl font-bold">{profile?.totalXp ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Tabs
          value={category}
          onValueChange={(v) => setCategory(v ?? "todos")}
          className="w-full sm:w-auto"
        >
          <TabsList className="flex flex-wrap h-auto">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="text-xs">
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "todos")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum curso encontrado para os filtros selecionados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={enrollmentMap.get(course.id) ?? null}
              userLevel={profile?.level ?? 1}
              onEnroll={handleEnroll}
            />
          ))}
        </div>
      )}

      {/* New Course Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Curso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Nome do curso"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Descrição breve"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={newCourse.category}
                  onValueChange={(v) =>
                    setNewCourse({ ...newCourse, category: v ?? "atendimento" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.value !== "todos").map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dificuldade</Label>
                <Select
                  value={newCourse.difficulty}
                  onValueChange={(v) =>
                    setNewCourse({ ...newCourse, difficulty: v ?? "iniciante" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.filter((d) => d.value !== "todos").map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>URL Pillbits</Label>
              <Input
                value={newCourse.pillbitsUrl}
                onChange={(e) => setNewCourse({ ...newCourse, pillbitsUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Duração (min)</Label>
                <Input
                  type="number"
                  value={newCourse.durationMinutes}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      durationMinutes: Number(e.target.value) || 5,
                    })
                  }
                />
              </div>
              <div>
                <Label>XP</Label>
                <Input
                  type="number"
                  value={newCourse.xpReward}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      xpReward: Number(e.target.value) || 50,
                    })
                  }
                />
              </div>
              <div>
                <Label>Nível Req.</Label>
                <Input
                  type="number"
                  value={newCourse.requiredLevel}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      requiredLevel: Number(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mandatory"
                checked={newCourse.mandatory}
                onChange={(e) => setNewCourse({ ...newCourse, mandatory: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="mandatory">Obrigatório</Label>
            </div>
            <Button className="w-full" onClick={handleCreateCourse} disabled={!newCourse.title}>
              Criar Curso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
