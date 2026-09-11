import Link from "next/link";
import { CalendarDays, Users, Wallet, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCentsToBRL } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
};

const STATUS_VARIANT: Record<string, "warning" | "success" | "neutral" | "info"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELED: "neutral",
  COMPLETED: "info",
};

export default async function DashboardPage() {
  const session = await requireSession();
  const accountId = session.user.accountId;
  const isStaff = session.user.role === "STAFF";
  const staffFilter = isStaff ? { staffId: session.user.id } : {};

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todayCount, clientCount, monthRevenue, monthAppointmentCount, upcoming] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          accountId,
          ...staffFilter,
          startAt: { gte: startOfToday, lte: endOfToday },
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
      }),
      prisma.client.count({ where: { accountId } }),
      prisma.appointment.aggregate({
        where: {
          accountId,
          startAt: { gte: startOfMonth },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { priceCents: true },
      }),
      prisma.appointment.count({
        where: {
          accountId,
          ...staffFilter,
          startAt: { gte: startOfMonth },
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
      }),
      prisma.appointment.findMany({
        where: {
          accountId,
          ...staffFilter,
          startAt: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        orderBy: { startAt: "asc" },
        take: 5,
        include: { client: true, service: true },
      }),
    ]);

  const stats = [
    {
      label: isStaff ? "Meus agendamentos hoje" : "Agendamentos hoje",
      value: todayCount,
      icon: CalendarDays,
    },
    {
      label: "Clientes cadastradas",
      value: clientCount,
      icon: Users,
    },
    isStaff
      ? {
          label: "Meus atendimentos no mês",
          value: monthAppointmentCount,
          icon: Wallet,
        }
      : {
          label: "Faturamento do mês",
          value: formatCentsToBRL(monthRevenue._sum.priceCents ?? 0),
          icon: Wallet,
        },
    {
      label: "Próximo horário",
      value: upcoming[0]
        ? upcoming[0].startAt.toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          })
        : "—",
      icon: Clock,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description="Resumo da sua operação e próximos agendamentos."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
                  {stat.value}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <stat.icon className="h-5 w-5" strokeWidth={2} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Próximos agendamentos</CardTitle>
          <Link
            href="/app/agenda"
            className="text-xs font-medium text-rose-600 hover:underline"
          >
            Ver agenda completa
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-zinc-400">
              Nenhum agendamento futuro ainda.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {upcoming.map((appt) => (
                <li
                  key={appt.id}
                  className="flex items-center justify-between px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                      {appt.client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-800">
                        {appt.client.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {appt.service.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-500">
                      {appt.startAt.toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                    <Badge variant={STATUS_VARIANT[appt.status]}>
                      {STATUS_LABELS[appt.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
