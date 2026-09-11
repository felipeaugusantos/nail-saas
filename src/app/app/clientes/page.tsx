import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import ClientForm from "./client-form";
import ClientRowActions from "./client-row-actions";

export default async function ClientesPage() {
  const session = await requireSession();

  const clients = await prisma.client.findMany({
    where: { accountId: session.user.accountId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { appointments: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Cadastro e histórico das suas clientes."
      />

      <ClientForm />

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Telefone</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Atendimentos</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-zinc-50/60">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/app/clientes/${client.id}`}
                    className="flex items-center gap-3 hover:underline"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-800">
                      {client.name}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-zinc-600">{client.phone}</td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {client.email ?? "-"}
                </td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {client._count.appointments}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link
                      href={`/app/clientes/${client.id}`}
                      className="text-sm font-medium text-rose-600 hover:text-rose-700"
                    >
                      Ver ficha
                    </Link>
                    <ClientRowActions clientId={client.id} />
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-zinc-400">
                  Nenhum cliente cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
