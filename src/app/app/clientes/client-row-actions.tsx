"use client";

import { useTransition } from "react";
import { deleteClient } from "@/app/actions/clients";

export default function ClientRowActions({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        if (confirm("Remover este cliente?")) {
          startTransition(() => deleteClient(clientId));
        }
      }}
      className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      Remover
    </button>
  );
}
