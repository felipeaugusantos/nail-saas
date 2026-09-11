"use client";

import { useActionState, useRef, useEffect } from "react";
import { createStaff, type StaffState } from "@/app/actions/staff";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: StaffState = {};

export default function StaffForm() {
  const [state, formAction, pending] = useActionState(
    createStaff,
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
        <div className="w-56">
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            name="email"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div className="w-44">
          <label className={labelClass}>Senha inicial</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Adicionar colaborador"}
        </Button>
        {state.error && (
          <p className="w-full text-sm text-red-600">{state.error}</p>
        )}
      </form>
      <p className="mt-3 text-xs text-zinc-400">
        Compartilhe o e-mail e a senha diretamente com o colaborador — ele já
        pode entrar em {" "}
        <span className="font-medium text-zinc-500">/login</span> após o
        cadastro. Depois, configure a disponibilidade dele em Configurações.
      </p>
    </Card>
  );
}
