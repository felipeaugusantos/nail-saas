"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Sparkles,
  Settings,
  ExternalLink,
  UserCog,
  Wallet,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignOutButton from "@/components/sign-out-button";

const ownerNavItems = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/clientes", label: "Clientes", icon: Users },
  { href: "/app/servicos", label: "Serviços", icon: Sparkles },
  { href: "/app/colaboradores", label: "Colaboradores", icon: UserCog },
  { href: "/app/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/app/estoque", label: "Estoque", icon: Boxes },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings },
];

const staffNavItems = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/app/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/app/clientes", label: "Clientes", icon: Users },
];

export default function AppSidebar({
  accountName,
  accountSlug,
  userName,
  role,
}: {
  accountName: string;
  accountSlug: string;
  userName: string;
  role: "OWNER" | "STAFF";
}) {
  const pathname = usePathname();
  const navItems = role === "OWNER" ? ownerNavItems : staffNavItems;

  const initials = accountName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-sm font-bold text-white">
          N
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-900">
          Nail SAAS
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-rose-50 text-rose-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-zinc-100 p-3">
        {role === "OWNER" && (
          <Link
            href={`/${accountSlug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver página pública
          </Link>
        )}

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            {initials || "N"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-800">
              {userName}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {role === "OWNER" ? accountName : `${accountName} · Colaborador(a)`}
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
