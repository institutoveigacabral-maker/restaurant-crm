"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  UtensilsCrossed,
  ChefHat,
  LogOut,
  Loader2,
  BookOpen,
  BarChart3,
  Lightbulb,
  Settings,
  Activity,
  FileCode,
  ToggleLeft,
  GraduationCap,
  Trophy,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Clientes", icon: Users },
  { href: "/reservations", label: "Reservas", icon: CalendarDays },
  { href: "/orders", label: "Pedidos", icon: UtensilsCrossed },
  { href: "/menu", label: "Cardápio", icon: BookOpen },
  { href: "/reports", label: "Relatórios", icon: BarChart3 },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/training", label: "Treinamento", icon: GraduationCap },
  { href: "/gamification", label: "Gamificação", icon: Trophy },
];

const roleLabel: Record<string, string> = {
  admin: "Admin",
  gerente: "Gerente",
  garcom: "Garçom",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const user = session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user as any)?.role as string;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold">RestaurantCRM</h1>
            <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
          </div>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Configurações
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === "/settings"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
            </li>
            <li>
              <Link
                href="/settings/flags"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith("/settings/flags")
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <ToggleLeft className="w-4 h-4" />
                Feature Flags
              </Link>
            </li>
            <li>
              <Link
                href="/settings/webhooks"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith("/settings/webhooks")
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Settings className="w-4 h-4" />
                Webhooks
              </Link>
            </li>
            <li>
              <Link
                href="/settings/health"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith("/settings/health")
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Activity className="w-4 h-4" />
                Status
              </Link>
            </li>
            <li>
              <Link
                href="/settings/api-docs"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname.startsWith("/settings/api-docs")
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <FileCode className="w-4 h-4" />
                API Docs
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <Separator />
      <div className="p-3">
        {status === "loading" ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            {role && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {roleLabel[role] || role}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
