import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AgendamentoConfirmadoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="max-w-md text-center">
        <CardContent className="py-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">
            Agendamento confirmado!
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Você receberá um e-mail de confirmação em breve. Até lá!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
