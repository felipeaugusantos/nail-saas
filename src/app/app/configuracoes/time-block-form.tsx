"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import {
  createTimeBlock,
  type TimeBlockState,
} from "@/app/actions/timeblocks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: TimeBlockState = {};

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function TimeBlockForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    createTimeBlock,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [wholeDay, setWholeDay] = useState(true);

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

        <div className="w-40">
          <label className={labelClass}>Data</label>
          <input
            type="date"
            name="date"
            required
            min={todayISODate()}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <label className="flex items-center gap-2 pb-2.5 text-sm font-medium text-zinc-700">
          <input
            type="checkbox"
            name="wholeDay"
            checked={wholeDay}
            onChange={(e) => setWholeDay(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
          />
          Dia inteiro
        </label>

        {!wholeDay && (
          <>
            <div className="w-32">
              <label className={labelClass}>Início</label>
              <input
                type="time"
                name="start"
                required={!wholeDay}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
            <div className="w-32">
              <label className={labelClass}>Fim</label>
              <input
                type="time"
                name="end"
                required={!wholeDay}
                className={`mt-1.5 ${inputClass}`}
              />
            </div>
          </>
        )}

        <div className="min-w-[160px] flex-1">
          <label className={labelClass}>Motivo (opcional)</label>
          <input
            name="reason"
            placeholder="Ex: Feriado, férias..."
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Bloquear"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
