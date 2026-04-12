"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronDown, Building2, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tenant {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  parentId: string | null;
  role: string;
}

export default function TenantSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const currentTenantId = session?.user?.tenantId;

  useEffect(() => {
    fetch("/api/tenants")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setTenants(d.data || []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || tenants.length <= 1) return null;

  const currentTenant = tenants.find((t) => t.tenantId === currentTenantId);
  const parentTenants = tenants.filter((t) => !t.parentId);
  const childTenants = tenants.filter((t) => t.parentId);

  async function switchTenant(tenant: Tenant) {
    if (tenant.tenantId === currentTenantId) return;

    await update({
      tenantId: tenant.tenantId,
      tenantSlug: tenant.tenantSlug,
      tenantName: tenant.tenantName,
      role: tenant.role,
    });

    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors cursor-pointer outline-none">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
          <span className="font-medium truncate">{currentTenant?.tenantName || "Selecionar"}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {parentTenants.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs">Grupo</DropdownMenuLabel>
            {parentTenants.map((t) => (
              <DropdownMenuItem
                key={t.tenantId}
                onClick={() => switchTenant(t)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{t.tenantName}</span>
                {t.tenantId === currentTenantId && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {childTenants.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Marcas</DropdownMenuLabel>
            {childTenants.map((t) => (
              <DropdownMenuItem
                key={t.tenantId}
                onClick={() => switchTenant(t)}
                className="flex items-center justify-between"
              >
                <span className="truncate">{t.tenantName}</span>
                {t.tenantId === currentTenantId && <Check className="w-4 h-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
