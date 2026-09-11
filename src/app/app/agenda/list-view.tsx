import { prisma } from "@/lib/prisma";
import { formatCentsToBRL } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppointmentActions from "./appointment-actions";

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

export default async function ListView({
  accountId,
  staffId,
}: {
  accountId: string;
  staffId?: string;
}) {
  const appointments = await prisma.appointment.findMany({
    where: {
      accountId,
      ...(staffId ? { staffId } : {}),
      startAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { startAt: "asc" },
    include: { client: true, service: true },
    take: 100,
  });

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
            <th className="px-5 py-3">Data/Hora</th>
            <th className="px-5 py-3">Cliente</th>
            <th className="px-5 py-3">Serviço</th>
            <th className="px-5 py-3">Valor</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-zinc-50/60">
              <td className="px-5 py-3.5 text-zinc-800">
                {appt.startAt.toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                    {appt.client.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800">
                      {appt.client.name}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {appt.client.phone}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3.5 text-zinc-600">
                {appt.service.name}
              </td>
              <td className="px-5 py-3.5 text-zinc-600">
                {formatCentsToBRL(appt.priceCents)}
              </td>
              <td className="px-5 py-3.5">
                <Badge variant={STATUS_VARIANT[appt.status]}>
                  {STATUS_LABELS[appt.status]}
                </Badge>
              </td>
              <td className="px-5 py-3.5 text-right">
                <AppointmentActions
                  appointmentId={appt.id}
                  status={appt.status}
                />
              </td>
            </tr>
          ))}
          {appointments.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-10 text-center text-zinc-400">
                Nenhum agendamento futuro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
