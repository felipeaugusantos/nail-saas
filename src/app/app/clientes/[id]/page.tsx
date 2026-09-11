import { notFound } from "next/navigation";
import { Link2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { buildPortalUrl, formatCentsToBRL } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, accountId: session.user.accountId },
    include: {
      anamnesis: true,
      appointments: {
        orderBy: { startAt: "desc" },
        include: { service: true, staff: true },
        take: 50,
      },
    },
  });

  if (!client) notFound();

  const portalUrl = buildPortalUrl(client.portalToken);

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={`${client.phone}${client.email ? ` · ${client.email}` : ""}`}
      />

      <Card>
        <CardHeader>
          <CardTitle>Portal da cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Link pessoal onde ela vê o histórico, cancela/remarca e preenche a
            ficha de anamnese:
          </p>
          <a
            href={portalUrl}
            target="_blank"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
          >
            <Link2 className="h-3.5 w-3.5" />
            {portalUrl}
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ficha de anamnese</CardTitle>
        </CardHeader>
        <CardContent>
          <AnamnesisForm clientId={client.id} anamnesis={client.anamnesis} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Histórico de atendimentos</CardTitle>
        </CardHeader>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3">Data/Hora</th>
              <th className="px-5 py-3">Serviço</th>
              <th className="px-5 py-3">Profissional</th>
              <th className="px-5 py-3">Valor</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {client.appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-zinc-50/60">
                <td className="px-5 py-3.5 text-zinc-800">
                  {appt.startAt.toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {appt.service.name}
                </td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {appt.staff?.name ?? "-"}
                </td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {formatCentsToBRL(appt.priceCents)}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={STATUS_VARIANT[appt.status]}>
                    {STATUS_LABELS[appt.status]}
                  </Badge>
                </td>
              </tr>
            ))}
            {client.appointments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-zinc-400">
                  Nenhum atendimento ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
