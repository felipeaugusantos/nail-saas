import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  addDays,
  formatWeekRangeLabel,
  isSameDay,
  toDateOnlyString,
  weekDayLabel,
} from "@/lib/week";
import { Card } from "@/components/ui/card";

const SLOT_MINUTES = 30;
const DEFAULT_START_MINUTE = 8 * 60;
const DEFAULT_END_MINUTE = 20 * 60;

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; accent: string }
> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", accent: "border-l-amber-500" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", accent: "border-l-emerald-500" },
  COMPLETED: { bg: "bg-blue-50", text: "text-blue-700", accent: "border-l-blue-500" },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default async function WeekView({
  accountId,
  weekStart,
}: {
  accountId: string;
  weekStart: Date;
}) {
  const weekEnd = addDays(weekStart, 7);

  const [rules, appointments] = await Promise.all([
    prisma.availability.findMany({ where: { accountId } }),
    prisma.appointment.findMany({
      where: {
        accountId,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        startAt: { gte: weekStart, lt: weekEnd },
      },
      orderBy: { startAt: "asc" },
      include: { client: true, service: true },
    }),
  ]);

  const startMinute =
    rules.length > 0
      ? Math.floor(Math.min(...rules.map((r) => r.startMinute)) / 60) * 60
      : DEFAULT_START_MINUTE;
  const endMinute =
    rules.length > 0
      ? Math.ceil(Math.max(...rules.map((r) => r.endMinute)) / 60) * 60
      : DEFAULT_END_MINUTE;

  const totalSlots = Math.max((endMinute - startMinute) / SLOT_MINUTES, 1);
  const hourLabels: number[] = [];
  for (let h = Math.floor(startMinute / 60); h < endMinute / 60; h++) {
    hourLabels.push(h);
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const prevWeek = toDateOnlyString(addDays(weekStart, -7));
  const nextWeek = toDateOnlyString(addDays(weekStart, 7));

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
        <Link
          href={`/app/agenda?view=semana&week=${prevWeek}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-semibold text-zinc-800">
          {formatWeekRangeLabel(weekStart)}
        </span>
        <Link
          href={`/app/agenda?view=semana&week=${nextWeek}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* day header */}
      <div
        className="grid border-b border-zinc-100"
        style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}
      >
        <div />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={cn(
                "py-2.5 text-center",
                isToday && "rounded-t-lg bg-rose-50"
              )}
            >
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  isToday ? "text-rose-700" : "text-zinc-400"
                )}
              >
                {weekDayLabel(i)}
              </span>
              <div
                className={cn(
                  "mt-0.5 text-sm font-semibold",
                  isToday ? "text-rose-700" : "text-zinc-700"
                )}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* grid */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: "56px repeat(7, 1fr)",
            gridTemplateRows: `repeat(${totalSlots}, 26px)`,
          }}
        >
          {/* today column tint */}
          {days.map((day, i) =>
            isSameDay(day, today) ? (
              <div
                key={`tint-${i}`}
                className="bg-rose-50/40"
                style={{ gridColumn: i + 2, gridRow: `1 / span ${totalSlots}` }}
              />
            ) : null
          )}

          {/* hour separators + labels */}
          {hourLabels.map((h) => {
            const row = (h * 60 - startMinute) / SLOT_MINUTES + 1;
            return (
              <div key={`hour-${h}`} style={{ gridColumn: 1, gridRow: `${row} / span 2` }}>
                <span className="-translate-y-1.5 block pr-2 text-right text-[10px] text-zinc-400">
                  {String(h).padStart(2, "0")}:00
                </span>
              </div>
            );
          })}
          {hourLabels.map((h) => {
            const row = (h * 60 - startMinute) / SLOT_MINUTES + 1;
            return (
              <div
                key={`line-${h}`}
                className="border-t border-zinc-100"
                style={{ gridColumn: "2 / span 7", gridRow: row }}
              />
            );
          })}

          {/* appointments */}
          {appointments.map((appt) => {
            const dayIndex = appt.startAt.getDay();
            const startOfDayMinutes =
              appt.startAt.getHours() * 60 + appt.startAt.getMinutes();
            const durationMinutes = Math.max(
              (appt.endAt.getTime() - appt.startAt.getTime()) / 60000,
              SLOT_MINUTES
            );

            const clampedStart = clamp(startOfDayMinutes, startMinute, endMinute);
            const row = (clampedStart - startMinute) / SLOT_MINUTES + 1;
            const maxSpan = totalSlots - (row - 1);
            const span = clamp(
              Math.ceil(durationMinutes / SLOT_MINUTES),
              1,
              maxSpan
            );

            const style = STATUS_STYLES[appt.status] ?? STATUS_STYLES.PENDING;

            return (
              <div
                key={appt.id}
                title={`${appt.client.name} · ${appt.service.name} · ${appt.startAt.toLocaleTimeString(
                  "pt-BR",
                  { hour: "2-digit", minute: "2-digit" }
                )}`}
                className={cn(
                  "m-[2px] overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight",
                  style.bg,
                  style.text,
                  style.accent
                )}
                style={{ gridColumn: dayIndex + 2, gridRow: `${row} / span ${span}` }}
              >
                <p className="truncate font-semibold">{appt.client.name}</p>
                <p className="truncate">{appt.service.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
