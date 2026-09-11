"use client";

import { useTransition } from "react";
import { updateAppointmentStatus } from "@/app/actions/appointments";

export default function AppointmentActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-4 text-sm">
      {status === "PENDING" && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              updateAppointmentStatus(appointmentId, "CONFIRMED")
            )
          }
          className="font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-60"
        >
          Confirmar
        </button>
      )}
      {(status === "PENDING" || status === "CONFIRMED") && (
        <button
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              updateAppointmentStatus(appointmentId, "COMPLETED")
            )
          }
          className="font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
        >
          Concluir
        </button>
      )}
      {status !== "CANCELED" && status !== "COMPLETED" && (
        <button
          disabled={isPending}
          onClick={() => {
            if (confirm("Cancelar este agendamento?")) {
              startTransition(() =>
                updateAppointmentStatus(appointmentId, "CANCELED")
              );
            }
          }}
          className="font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
