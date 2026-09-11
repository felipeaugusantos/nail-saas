"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  createStockMovement,
  type MovementState,
} from "@/app/actions/products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: MovementState = {};

export default function MovementForm({
  products,
}: {
  products: { id: string; name: string; unit: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    createStockMovement,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  if (products.length === 0) {
    return (
      <Card className="p-5">
        <p className="text-sm text-zinc-500">
          Cadastre um produto na aba Produtos antes de lançar movimentações.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-end gap-4"
      >
        <div className="min-w-[180px] flex-1">
          <label className={labelClass}>Produto</label>
          <select name="productId" required className={`mt-1.5 ${inputClass}`}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-36">
          <label className={labelClass}>Tipo</label>
          <select name="type" required className={`mt-1.5 ${inputClass}`}>
            <option value="IN">Entrada</option>
            <option value="OUT">Saída</option>
            <option value="ADJUSTMENT">Ajuste (definir total)</option>
          </select>
        </div>
        <div className="w-28">
          <label className={labelClass}>Quantidade</label>
          <input
            name="quantity"
            type="number"
            min={0}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className={labelClass}>Motivo (opcional)</label>
          <input
            name="reason"
            placeholder="Ex: Compra de reposição"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Registrar movimentação"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
