import { prisma } from "@/lib/prisma";

const SLOT_STEP_MIN = 15;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Retorna os horários de início disponíveis (Date) para um dia, considerando
 * as regras de disponibilidade recorrentes e os agendamentos já existentes
 * de um profissional (staffUserId) específico.
 */
export async function getAvailableSlots(
  accountId: string,
  staffUserId: string,
  date: Date,
  durationMin: number
): Promise<Date[]> {
  const weekday = date.getDay();

  const [rules, appointments] = await Promise.all([
    prisma.availability.findMany({
      where: { accountId, userId: staffUserId, weekday },
    }),
    prisma.appointment.findMany({
      where: {
        accountId,
        staffId: staffUserId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      select: { startAt: true, endAt: true },
    }),
  ]);

  const slots: Date[] = [];

  for (const rule of rules) {
    for (
      let minute = rule.startMinute;
      minute + durationMin <= rule.endMinute;
      minute += SLOT_STEP_MIN
    ) {
      const slotStart = new Date(date);
      slotStart.setHours(0, minute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + durationMin * 60000);

      const overlaps = appointments.some(
        (appt) => slotStart < appt.endAt && slotEnd > appt.startAt
      );

      if (!overlaps && slotStart.getTime() > Date.now()) {
        slots.push(slotStart);
      }
    }
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

export const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export function minutesToTimeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function timeLabelToMinutes(label: string): number {
  const [h, m] = label.split(":").map(Number);
  return h * 60 + m;
}
