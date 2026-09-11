import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StaffForm from "./staff-form";
import StaffRowActions from "./staff-row-actions";

export default async function ColaboradoresPage() {
  const session = await requireOwner();

  const staff = await prisma.user.findMany({
    where: { accountId: session.user.accountId, role: "STAFF" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { staffAppointments: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        description="Cadastre profissionais que atendem na sua conta — cada um tem login e disponibilidade próprios."
      />

      <StaffForm />

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">E-mail</th>
              <th className="px-5 py-3">Atendimentos</th>
              <th className="px-5 py-3">Reservável</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-50/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-zinc-800">
                      {member.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-zinc-600">{member.email}</td>
                <td className="px-5 py-3.5 text-zinc-600">
                  {member._count.staffAppointments}
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={member.bookable ? "success" : "neutral"}>
                    {member.bookable ? "Sim" : "Não"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={member.active ? "success" : "neutral"}>
                    {member.active ? "Ativo" : "Inativo"}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <StaffRowActions
                    userId={member.id}
                    active={member.active}
                    bookable={member.bookable}
                  />
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-zinc-400">
                  Nenhum colaborador cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
