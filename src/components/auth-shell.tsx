import { ReactNode } from "react";
import { CalendarCheck2, Users2, CreditCard } from "lucide-react";

const highlights = [
  {
    icon: CalendarCheck2,
    title: "Agenda sempre organizada",
    text: "Defina sua disponibilidade e deixe as clientes agendarem sozinhas.",
  },
  {
    icon: Users2,
    title: "Histórico de clientes",
    text: "Cada atendimento fica registrado automaticamente no perfil da cliente.",
  },
  {
    icon: CreditCard,
    title: "Pagamento online",
    text: "Receba sinal ou pagamento total no momento do agendamento.",
  },
];

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-zinc-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.35),_transparent_55%)]" />
        <div className="relative flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-sm font-bold">
            N
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Nail SAAS
          </span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            A agenda do seu salão, no piloto automático.
          </h2>
          <div className="mt-10 space-y-6">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <item.icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-zinc-500">
          © {new Date().getFullYear()} Nail SAAS. Feito para nail designers.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
