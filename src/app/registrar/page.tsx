"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { registerAccount, type RegisterState } from "@/app/actions/auth";
import AuthShell from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

const initialState: RegisterState = {};

export default function RegistrarPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    registerAccount,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.push("/login?registrado=1");
    }
  }, [state.success, router]);

  return (
    <AuthShell>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
        Crie sua conta
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Comece a gerenciar sua agenda de nail design gratuitamente.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Nome do salão/profissional</label>
          <input
            name="accountName"
            required
            className={`mt-1.5 ${inputClass}`}
            placeholder="Ex: Studio Unhas da Ana"
          />
        </div>
        <div>
          <label className={labelClass}>Seu nome</label>
          <input name="name" required className={`mt-1.5 ${inputClass}`} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input
            type="email"
            name="email"
            required
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label className={labelClass}>Senha</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-medium text-rose-600 hover:text-rose-700">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
