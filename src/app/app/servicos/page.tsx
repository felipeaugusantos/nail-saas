import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatCentsToBRL } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceForm from "./service-form";
import ServiceRowActions from "./service-row-actions";

export default async function ServicosPage() {
  const session = await requireSession();

  const services = await prisma.service.findMany({
    where: { accountId: session.user.accountId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Cadastre os serviços oferecidos, duração e preço."
      />

      <ServiceForm />

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3">Serviço</th>
              <th className="px-5 py-3">Duração</th>
              <th className="px-5 py-3">Preço</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-zinc-50/60">
                <td className="px-5 py-3.5 font-medium text-zinc-800">
                  {service.name}
                </td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {service.durationMin} min
                </td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {formatCentsToBRL(service.priceCents)}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={service.active ? "success" : "neutral"}>
                    {service.active ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <ServiceRowActions
                    serviceId={service.id}
                    active={service.active}
                  />
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-zinc-400">
                  Nenhum serviço cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
