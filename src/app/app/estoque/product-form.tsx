"use client";

import { useActionState, useRef, useEffect } from "react";
import { createProduct, type ProductState } from "@/app/actions/products";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: ProductState = {};

export default function ProductForm() {
  const [state, formAction, pending] = useActionState(
    createProduct,
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
          <label className={labelClass}>Nome do produto</label>
          <input
            name="name"
            required
            placeholder="Ex: Esmalte vermelho 8ml"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-28">
          <label className={labelClass}>SKU</label>
          <input name="sku" className={`mt-1.5 ${inputClass}`} />
        </div>
        <div className="w-20">
          <label className={labelClass}>Unidade</label>
          <input
            name="unit"
            defaultValue="un"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-28">
          <label className={labelClass}>Custo (R$)</label>
          <input
            name="cost"
            type="number"
            min={0}
            step={0.01}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-28">
          <label className={labelClass}>Preço (R$)</label>
          <input
            name="price"
            type="number"
            min={0}
            step={0.01}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-32">
          <label className={labelClass}>Alerta estoque</label>
          <input
            name="lowStockAlert"
            type="number"
            min={0}
            defaultValue={0}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar produto"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
