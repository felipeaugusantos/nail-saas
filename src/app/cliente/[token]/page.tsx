import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppointmentActions from "./appointment-actions";
import AnamnesisForm from "./anamnesis-form";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELED: "Cancelado",
  COMPLETED: "Concluído",
};

const STATUS_VARIANT: Record<
  string,
  "warning" | "success" | "neutral" | "info"
> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELED: "neutral",
  COMPLETED: "info",
};

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      account: true,
      anamnesis: true,
      appointments: {
        orderBy: { startAt: "desc" },
        include: { service: true, staff: true },
        take: 50,
      },
    },
  });

  if (!client) notFound();

  const now = new Date();
  const upcoming = client.appointments.filter(
    (a) => a.startAt > now && ["PENDING", "CONFIRMED"].includes(a.status)
  );
  const history = client.appointments.filter(
    (a) => !(a.startAt > now && ["PENDING", "CONFIRMED"].includes(a.status))
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="h-28 bg-gradient-to-br from-zinc-900 via-zinc-900 to-rose-900" />

      <div className="mx-auto -mt-10 max-w-2xl px-4 pb-16">
        <div className="mb-6 flex items-end gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-zinc-50 bg-rose-600 text-xl font-bold text-white shadow-sm">
            {client.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="pb-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Olá, {client.name.split(" ")[0]}!
            </h1>
            <p className="text-sm text-zinc-500">{client.account.name}</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Próximos agendamentos</CardTitle>
              <a
                href={`/${client.account.slug}`}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Novo agendamento
              </a>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcoming.length === 0 && (
                <p className="text-sm text-zinc-400">
                  Nenhum agendamento futuro.
                </p>
              )}
              {upcoming.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {appt.service.name}
                      {appt.staff && ` · ${appt.staff.name}`}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {appt.startAt.toLocaleString("pt-BR", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_VARIANT[appt.status]}>
                      {STATUS_LABELS[appt.status]}
                    </Badge>
                    <AppointmentActions
                      token={token}
                      appointmentId={appt.id}
                      accountSlug={client.account.slug}
                      clientName={client.name}
                      clientPhone={client.phone}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {history.length === 0 && (
                <p className="text-sm text-zinc-400">
                  Nenhum atendimento anterior.
                </p>
              )}
              {history.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-700">
                      {appt.service.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {appt.startAt.toLocaleDateString("pt-BR")} ·{" "}
                      {formatCentsToBRL(appt.priceCents)}
                    </p>
                  </div>
                  <Badge variant={STATUS_VARIANT[appt.status]}>
                    {STATUS_LABELS[appt.status]}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ficha de anamnese</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-xs text-zinc-500">
                Essas informações ajudam a equipe a te atender com mais
                segurança e cuidado.
              </p>
              <AnamnesisForm token={token} anamnesis={client.anamnesis} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
