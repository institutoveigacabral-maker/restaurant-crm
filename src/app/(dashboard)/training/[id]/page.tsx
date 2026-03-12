"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Star, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { fetchCourse, fetchEnrollments, enrollInCourse, updateCourseProgress } from "@/lib/api";

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

// ── Constants ───────────────────────────────────────────────

const categoryColor: Record<string, string> = {
  atendimento: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  cozinha: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  higiene: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  gestao: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  bebidas: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  seguranca_alimentar: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  vendas: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
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

// ── Main Page ───────────────────────────────────────────────

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment["enrollment"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [courseData, enrollmentsData] = await Promise.all([
          fetchCourse(id),
          fetchEnrollments(),
        ]);
        setCourse(courseData as unknown as Course);
        const enrollments = enrollmentsData as unknown as Enrollment[];
        const match = enrollments.find((e) => e.enrollment?.courseId === Number(id));
        if (match) setEnrollment(match.enrollment);
      } catch (err) {
        if (err instanceof Error) toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleEnroll = async () => {
    if (!course) return;
    setEnrolling(true);
    try {
      await enrollInCourse(course.id);
      const enrollmentsData = await fetchEnrollments();
      const enrollments = enrollmentsData as unknown as Enrollment[];
      const match = enrollments.find((e) => e.enrollment?.courseId === course.id);
      if (match) setEnrollment(match.enrollment);
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleComplete = async () => {
    if (!enrollment) return;
    setCompleting(true);
    try {
      await updateCourseProgress(enrollment.id, 100, 100);
      setEnrollment({ ...enrollment, status: "completed", progress: 100, score: 100 });
    } catch (err) {
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-muted-foreground">Curso não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/training")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const isCompleted = enrollment?.status === "completed";
  const isEnrolled = !!enrollment;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Botão voltar */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/training")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para Treinamento
      </Button>

      {/* Cabeçalho do curso */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor[course.category] ?? "bg-muted text-muted-foreground"}`}
          >
            {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[course.difficulty] ?? "bg-muted"}`}
          >
            {difficultyLabel[course.difficulty] ?? course.difficulty}
          </span>
          {course.mandatory && (
            <Badge variant="destructive" className="text-xs">
              Obrigatório
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          {course.title}
        </h1>

        {course.description && <p className="text-muted-foreground">{course.description}</p>}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {course.durationMinutes} minutos
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            {course.xpReward} XP
          </span>
        </div>
      </div>

      <Separator />

      {/* Status da inscrição e ações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seu Progresso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">Curso concluído!</span>
              {enrollment?.score != null && (
                <Badge variant="secondary" className="ml-2">
                  Nota: {enrollment.score}
                </Badge>
              )}
            </div>
          ) : isEnrolled ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} />
              </div>
              <Button onClick={handleComplete} disabled={completing} className="w-full sm:w-auto">
                {completing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar como Concluído
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Você ainda não está inscrito neste curso.
              </p>
              <Button onClick={handleEnroll} disabled={enrolling} className="w-full sm:w-auto">
                {enrolling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Inscrever-se
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embed Pillbits */}
      {course.pillbitsUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conteúdo do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src={course.pillbitsUrl}
              className="w-full h-[600px] rounded-lg border"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
