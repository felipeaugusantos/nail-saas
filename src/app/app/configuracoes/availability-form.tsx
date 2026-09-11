"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  addAvailabilityRule,
  type AvailabilityState,
} from "@/app/actions/availability";
import { WEEKDAY_LABELS } from "@/lib/availability";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: AvailabilityState = {};

export default function AvailabilityForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    addAvailabilityRule,
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
        <input type="hidden" name="userId" value={userId} />
        <div className="w-44">
          <label className={labelClass}>Dia da semana</label>
          <select
            name="weekday"
            required
            className={`mt-1.5 ${inputClass}`}
          >
            {WEEKDAY_LABELS.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className={labelClass}>Início</label>
          <input
            type="time"
            name="start"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-32">
          <label className={labelClass}>Fim</label>
          <input
            type="time"
            name="end"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar horário"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
