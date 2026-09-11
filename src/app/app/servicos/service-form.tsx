"use client";

import { useActionState, useRef, useEffect } from "react";
import { createService, type ServiceState } from "@/app/actions/services";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: ServiceState = {};

export default function ServiceForm() {
  const [state, formAction, pending] = useActionState(
    createService,
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
        <div className="min-w-[200px] flex-1">
          <label className={labelClass}>Nome do serviço</label>
          <input
            name="name"
            required
            placeholder="Ex: Esmaltação em gel"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-32">
          <label className={labelClass}>Duração (min)</label>
          <input
            name="durationMin"
            type="number"
            min={5}
            step={5}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-32">
          <label className={labelClass}>Preço (R$)</label>
          <input
            name="price"
            type="number"
            min={0}
            step={0.01}
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar serviço"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
