"use client";

import { useTransition } from "react";
import {
  toggleStaffActive,
  toggleStaffBookable,
  deleteStaff,
} from "@/app/actions/staff";

export default function StaffRowActions({
  userId,
  active,
  bookable,
}: {
  userId: string;
  active: boolean;
  bookable: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-4 text-sm">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleStaffBookable(userId))}
        className="font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
      >
        {bookable ? "Ocultar da página pública" : "Mostrar na página pública"}
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(() => toggleStaffActive(userId))}
        className="font-medium text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
      >
        {active ? "Desativar" : "Ativar"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (
            confirm(
              "Remover este colaborador? O login dele deixará de funcionar."
            )
          ) {
            startTransition(() => deleteStaff(userId));
          }
        }}
        className="font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
      >
        Remover
      </button>
    </div>
  );
}
