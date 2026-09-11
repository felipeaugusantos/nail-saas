"use client";

import { useActionState, useRef, useEffect } from "react";
import { createClient, type ClientState } from "@/app/actions/clients";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: ClientState = {};

export default function ClientForm() {
  const [state, formAction, pending] = useActionState(
    createClient,
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
        <div className="min-w-[160px] flex-1">
          <label className={labelClass}>Nome</label>
          <input name="name" required className={`mt-1.5 ${inputClass}`} />
        </div>
        <div className="w-44">
          <label className={labelClass}>Telefone</label>
          <input
            name="phone"
            required
            placeholder="(11) 91234-5678"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-56">
          <label className={labelClass}>E-mail (opcional)</label>
          <input
            name="email"
            type="email"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar cliente"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
    </Card>
  );
}
