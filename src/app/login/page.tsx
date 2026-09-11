"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import AuthShell from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { inputClass, labelClass } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrado = searchParams.get("registrado");
  const callbackUrl = searchParams.get("callbackUrl") || "/app";

  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setPending(false);

    if (res?.error) {
      setError("E-mail ou senha inválidos");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthShell>
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
        Entrar
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Acesse sua agenda de nail design.
      </p>

      {registrado && (
        <p className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Conta criada com sucesso! Faça login para continuar.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            className={`mt-1.5 ${inputClass}`}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Ainda não tem conta?{" "}
        <Link
          href="/registrar"
          className="font-medium text-rose-600 hover:text-rose-700"
        >
          Criar conta
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
