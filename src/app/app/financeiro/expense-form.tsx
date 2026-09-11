"use client";

import { useActionState, useRef, useEffect } from "react";
import { createExpense, type ExpenseState } from "@/app/actions/expenses";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: ExpenseState = {};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "ALUGUEL", label: "Aluguel" },
  { value: "PRODUTOS", label: "Produtos" },
  { value: "SALARIOS", label: "Salários" },
  { value: "MARKETING", label: "Marketing" },
  { value: "OUTROS", label: "Outros" },
];

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ExpenseForm() {
  const [state, formAction, pending] = useActionState(
    createExpense,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <Card className="p-5">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-end gap-4"
      >
        <div className="min-w-[160px] flex-1">
          <label className={labelClass}>Descrição</label>
          <input
            name="description"
            required
            placeholder="Ex: Aluguel do salão"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-40">
          <label className={labelClass}>Categoria</label>
          <select name="category" required className={`mt-1.5 ${inputClass}`}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className={labelClass}>Valor (R$)</label>
          <input
            name="amount"
            type="number"
            min={0}
            step={0.01}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-40">
          <label className={labelClass}>Data</label>
          <input
            name="paidAt"
            type="date"
            required
            defaultValue={todayISODate()}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Lançar despesa"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
