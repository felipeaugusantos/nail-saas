import Link from "next/link";
import { CalendarCheck2, Users2, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: CalendarCheck2,
    title: "Agenda online",
    text: "Suas clientes agendam sozinhas nos horários que você libera.",
  },
  {
    icon: Users2,
    title: "Clientes e histórico",
    text: "Cadastro completo com histórico de todos os atendimentos.",
  },
  {
    icon: CreditCard,
    title: "Pagamento integrado",
    text: "Receba sinal ou pagamento total direto no agendamento.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-sm font-bold text-white">
            N
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            Nail SAAS
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Entrar
          </Link>
          <Link href="/registrar">
            <Button size="sm">Criar conta</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
          Feito para nail designers e salões de beleza
        </span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
          A agenda do seu salão,
          <br /> no piloto automático.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-zinc-500">
          Agendamento online, cadastro de clientes, serviços e pagamentos em
          um só lugar — para você focar no que faz de melhor.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/registrar">
            <Button size="lg">
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50">
        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <feature.icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm text-zinc-500">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Nail SAAS. Todos os direitos reservados.
      </footer>
    </div>
  );
}
