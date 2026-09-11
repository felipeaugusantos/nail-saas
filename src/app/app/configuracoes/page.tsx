import { Link2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { WEEKDAY_LABELS, minutesToTimeLabel } from "@/lib/availability";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AvailabilityForm from "./availability-form";
import AvailabilityRowActions from "./availability-row-actions";

export default async function ConfiguracoesPage() {
  const session = await requireSession();

  const [account, rules] = await Promise.all([
    prisma.account.findUnique({ where: { id: session.user.accountId } }),
    prisma.availability.findMany({
      where: { accountId: session.user.accountId },
      orderBy: [{ weekday: "asc" }, { startMinute: "asc" }],
    }),
  ]);

  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/${account?.slug}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Dados da conta e horários de disponibilidade para agendamento."
      />

      <Card>
        <CardHeader>
          <CardTitle>Página pública</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">
            Compartilhe este link com suas clientes para que agendem online:
          </p>
          <a
            href={`/${account?.slug}`}
            target="_blank"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline"
          >
            <Link2 className="h-3.5 w-3.5" />
            {publicUrl}
          </a>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">
          Horários de disponibilidade
        </h2>
        <AvailabilityForm />

        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                <th className="px-5 py-3">Dia da semana</th>
                <th className="px-5 py-3">Início</th>
                <th className="px-5 py-3">Fim</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-zinc-50/60">
                  <td className="px-5 py-3.5 font-medium text-zinc-800">
                    {WEEKDAY_LABELS[rule.weekday]}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {minutesToTimeLabel(rule.startMinute)}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {minutesToTimeLabel(rule.endMinute)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <AvailabilityRowActions ruleId={rule.id} />
                  </td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-zinc-400">
                    Nenhum horário configurado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
