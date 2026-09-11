"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

const CATEGORIES = ["ALUGUEL", "PRODUTOS", "SALARIOS", "MARKETING", "OUTROS"] as const;

const expenseSchema = z.object({
  description: z.string().min(2, "Informe a descrição"),
  amountCents: z.coerce.number().int().positive("Valor inválido"),
  category: z.enum(CATEGORIES),
  paidAt: z.string().min(1, "Informe a data"),
});

export type ExpenseState = { error?: string; success?: boolean };

export async function createExpense(
  _prevState: ExpenseState,
  formData: FormData
): Promise<ExpenseState> {
  const session = await requireOwner();

  const parsed = expenseSchema.safeParse({
    description: formData.get("description"),
    amountCents: Math.round(Number(formData.get("amount")) * 100),
    category: formData.get("category"),
    paidAt: formData.get("paidAt"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const paidAt = new Date(`${parsed.data.paidAt}T00:00:00`);
  if (Number.isNaN(paidAt.getTime())) {
    return { error: "Data inválida" };
  }

  await prisma.expense.create({
    data: {
      accountId: session.user.accountId,
      description: parsed.data.description,
      amountCents: parsed.data.amountCents,
      category: parsed.data.category,
      paidAt,
    },
  });

  revalidatePath("/app/financeiro");
  return { success: true };
}

export async function deleteExpense(expenseId: string) {
  const session = await requireOwner();

  await prisma.expense.deleteMany({
    where: { id: expenseId, accountId: session.user.accountId },
  });

  revalidatePath("/app/financeiro");
}
