"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/app/actions/expenses";

export default function ExpenseRowActions({
  expenseId,
}: {
  expenseId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Remover esta despesa?")) {
          startTransition(() => deleteExpense(expenseId));
        }
      }}
      className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      Remover
    </button>
  );
}
