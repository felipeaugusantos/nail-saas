const SHORT_WEEKDAY_LABELS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export function parseDateOnly(value: string | undefined): Date {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function toDateOnlyString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function weekDayLabel(index: number): string {
  return SHORT_WEEKDAY_LABELS[index];
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString("pt-BR", { month: "long" });
  const endMonth = weekEnd.toLocaleDateString("pt-BR", { month: "long" });
  const year = weekEnd.getFullYear();

  if (startMonth === endMonth) {
    return `${weekStart.getDate()} – ${weekEnd.getDate()} de ${endMonth} de ${year}`;
  }
  return `${weekStart.getDate()} de ${startMonth} – ${weekEnd.getDate()} de ${endMonth} de ${year}`;
}
