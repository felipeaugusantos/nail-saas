"use client";

import { useTransition } from "react";
import { deleteAvailabilityRule } from "@/app/actions/availability";

export default function AvailabilityRowActions({
  ruleId,
}: {
  ruleId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => startTransition(() => deleteAvailabilityRule(ruleId))}
      className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-60"
    >
      Remover
    </button>
  );
}
