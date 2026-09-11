"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelOwnAppointment } from "@/app/actions/clientPortal";

export default function AppointmentActions({
  token,
  appointmentId,
  accountSlug,
  clientName,
  clientPhone,
}: {
  token: string;
  appointmentId: string;
  accountSlug: string;
  clientName: string;
  clientPhone: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    if (!confirm("Cancelar este agendamento?")) return;
    startTransition(async () => {
      await cancelOwnAppointment(token, appointmentId);
    });
  }

  function handleReschedule() {
    if (!confirm("Vamos cancelar este horário para você escolher um novo. Continuar?"))
      return;
    startTransition(async () => {
      await cancelOwnAppointment(token, appointmentId);
      const params = new URLSearchParams({
        nome: clientName,
        telefone: clientPhone,
      });
      router.push(`/${accountSlug}?${params.toString()}`);
    });
  }

  return (
    <div className="flex gap-3 text-xs">
      <button
        disabled={isPending}
        onClick={handleReschedule}
        className="font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-60"
      >
        Remarcar
      </button>
      <button
        disabled={isPending}
        onClick={handleCancel}
        className="font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
      >
        Cancelar
      </button>
    </div>
  );
}
