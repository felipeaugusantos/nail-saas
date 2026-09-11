import { XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AgendamentoCanceladoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="max-w-md text-center">
        <CardContent className="py-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900">
            Pagamento não concluído
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Seu agendamento não foi confirmado. Você pode tentar novamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
