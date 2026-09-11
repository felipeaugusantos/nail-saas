import Link from "next/link";
import { requireSession } from "@/lib/session";
import { cn } from "@/lib/utils";
import { parseDateOnly, startOfWeek, toDateOnlyString } from "@/lib/week";
import { PageHeader } from "@/components/page-header";
import ListView from "./list-view";
import WeekView from "./week-view";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; week?: string }>;
}) {
  const session = await requireSession();
  const { view: viewParam, week: weekParam } = await searchParams;
  const view = viewParam === "semana" ? "semana" : "lista";

  const anchorDate = parseDateOnly(weekParam);
  const weekStart = startOfWeek(anchorDate);
  const weekParamValue = toDateOnlyString(weekStart);

  return (
    <div>
      <PageHeader
        title="Agenda"
        description={
          view === "semana"
            ? "Visão semanal dos seus agendamentos."
            : "Próximos agendamentos, a partir de hoje."
        }
        action={
          <div className="flex gap-1 rounded-lg bg-zinc-100 p-1">
            <Link
              href="/app/agenda?view=lista"
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                view === "lista"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Lista
            </Link>
            <Link
              href={`/app/agenda?view=semana&week=${weekParamValue}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium",
                view === "semana"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Semana
            </Link>
          </div>
        }
      />

      {view === "semana" ? (
        <WeekView accountId={session.user.accountId} weekStart={weekStart} />
      ) : (
        <ListView accountId={session.user.accountId} />
      )}
    </div>
  );
}
