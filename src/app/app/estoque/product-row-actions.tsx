"use client";

import { useTransition } from "react";
import { toggleProductActive, deleteProduct } from "@/app/actions/products";

export default function ProductRowActions({
  productId,
  active,
}: {
  productId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-4 text-sm">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleProductActive(productId))}
        className="font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
      >
        {active ? "Desativar" : "Ativar"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Remover este produto?")) {
            startTransition(() => deleteProduct(productId));
          }
        }}
        className="font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
      >
        Remover
      </button>
    </div>
  );
}
