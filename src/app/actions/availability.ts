"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { timeLabelToMinutes } from "@/lib/availability";

const ruleSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

export type AvailabilityState = { error?: string; success?: boolean };

export async function addAvailabilityRule(
  _prevState: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  const session = await requireSession();

  const parsed = ruleSchema.safeParse({
    weekday: formData.get("weekday"),
    start: formData.get("start"),
    end: formData.get("end"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos" };
  }

  const startMinute = timeLabelToMinutes(parsed.data.start);
  const endMinute = timeLabelToMinutes(parsed.data.end);

  if (endMinute <= startMinute) {
    return { error: "O horário final deve ser depois do inicial" };
  }

  await prisma.availability.create({
    data: {
      accountId: session.user.accountId,
      weekday: parsed.data.weekday,
      startMinute,
      endMinute,
    },
  });

  revalidatePath("/app/configuracoes");
  return { success: true };
}

export async function deleteAvailabilityRule(ruleId: string) {
  const session = await requireSession();

  await prisma.availability.deleteMany({
    where: { id: ruleId, accountId: session.user.accountId },
  });

  revalidatePath("/app/configuracoes");
}
