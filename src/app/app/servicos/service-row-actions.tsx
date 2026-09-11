"use client";

import { useTransition } from "react";
import { toggleServiceActive, deleteService } from "@/app/actions/services";

export default function ServiceRowActions({
  serviceId,
  active,
}: {
  serviceId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-4 text-sm">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleServiceActive(serviceId))}
        className="font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
      >
        {active ? "Desativar" : "Ativar"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Remover este serviço?")) {
            startTransition(() => deleteService(serviceId));
          }
        }}
        className="font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
      >
        Remover
      </button>
    </div>
  );
}
