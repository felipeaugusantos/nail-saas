import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { cn, formatCentsToBRL } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ExpenseForm from "./expense-form";
import ExpenseRowActions from "./expense-row-actions";

const CATEGORY_LABELS: Record<string, string> = {
  ALUGUEL: "Aluguel",
  PRODUTOS: "Produtos",
  SALARIOS: "Salários",
  MARKETING: "Marketing",
  OUTROS: "Outros",
};

function monthRange(monthsAgo: number) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  start.setMonth(start.getMonth() - monthsAgo);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return { start, end };
}

export default async function FinanceiroPage() {
  const session = await requireOwner();
  const accountId = session.user.accountId;

  const { start: monthStart, end: monthEnd } = monthRange(0);

  const [monthRevenueAgg, monthExpenseAgg, recentExpenses, history] =
    await Promise.all([
      prisma.appointment.aggregate({
        where: {
          accountId,
          status: { in: ["CONFIRMED", "COMPLETED"] },
          startAt: { gte: monthStart, lt: monthEnd },
        },
        _sum: { priceCents: true },
      }),
      prisma.expense.aggregate({
        where: { accountId, paidAt: { gte: monthStart, lt: monthEnd } },
        _sum: { amountCents: true },
      }),
      prisma.expense.findMany({
        where: { accountId },
        orderBy: { paidAt: "desc" },
        take: 20,
      }),
      Promise.all(
        Array.from({ length: 6 }, (_, i) => 5 - i).map(async (monthsAgo) => {
          const { start, end } = monthRange(monthsAgo);
          const [revenue, expenses] = await Promise.all([
            prisma.appointment.aggregate({
              where: {
                accountId,
                status: { in: ["CONFIRMED", "COMPLETED"] },
                startAt: { gte: start, lt: end },
              },
              _sum: { priceCents: true },
            }),
            prisma.expense.aggregate({
              where: { accountId, paidAt: { gte: start, lt: end } },
              _sum: { amountCents: true },
            }),
          ]);
          return {
            label: start.toLocaleDateString("pt-BR", {
              month: "short",
              year: "2-digit",
            }),
            revenueCents: revenue._sum.priceCents ?? 0,
            expenseCents: expenses._sum.amountCents ?? 0,
          };
        })
      ),
    ]);

  const monthRevenue = monthRevenueAgg._sum.priceCents ?? 0;
  const monthExpenses = monthExpenseAgg._sum.amountCents ?? 0;
  const saldo = monthRevenue - monthExpenses;

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Receita dos agendamentos e despesas do mês."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">
                Receita do mês
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
                {formatCentsToBRL(monthRevenue)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">
                Despesas do mês
              </p>
              <p className="mt-1.5 text-2xl font-semibold text-zinc-900">
                {formatCentsToBRL(monthExpenses)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="h-5 w-5" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500">
                Saldo do mês
              </p>
              <p
                className={cn(
                  "mt-1.5 text-2xl font-semibold",
                  saldo >= 0 ? "text-zinc-900" : "text-red-600"
                )}
              >
                {formatCentsToBRL(saldo)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Wallet className="h-5 w-5" strokeWidth={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Últimos 6 meses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                <th className="px-5 py-3">Mês</th>
                <th className="px-5 py-3">Receita</th>
                <th className="px-5 py-3">Despesas</th>
                <th className="px-5 py-3">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {history.map((m) => {
                const balance = m.revenueCents - m.expenseCents;
                return (
                  <tr key={m.label}>
                    <td className="px-5 py-3 capitalize text-zinc-800">
                      {m.label}
                    </td>
                    <td className="px-5 py-3 text-emerald-700">
                      {formatCentsToBRL(m.revenueCents)}
                    </td>
                    <td className="px-5 py-3 text-red-600">
                      {formatCentsToBRL(m.expenseCents)}
                    </td>
                    <td
                      className={cn(
                        "px-5 py-3 font-medium",
                        balance >= 0 ? "text-zinc-800" : "text-red-600"
                      )}
                    >
                      {formatCentsToBRL(balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Despesas</h2>
        <ExpenseForm />

        <Card className="mt-4 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-xs font-medium uppercase tracking-wide text-zinc-400">
                <th className="px-5 py-3">Descrição</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Valor</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-zinc-50/60">
                  <td className="px-5 py-3.5 font-medium text-zinc-800">
                    {expense.description}
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="neutral">
                      {CATEGORY_LABELS[expense.category]}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {expense.paidAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-600">
                    {formatCentsToBRL(expense.amountCents)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ExpenseRowActions expenseId={expense.id} />
                  </td>
                </tr>
              ))}
              {recentExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-zinc-400">
                    Nenhuma despesa lançada ainda.
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
