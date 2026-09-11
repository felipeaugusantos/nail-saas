"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { timeLabelToMinutes } from "@/lib/availability";

const ruleSchema = z.object({
  userId: z.string().min(1),
  weekday: z.coerce.number().int().min(0).max(6),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
});

export type AvailabilityState = { error?: string; success?: boolean };

export async function addAvailabilityRule(
  _prevState: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  const session = await requireOwner();

  const parsed = ruleSchema.safeParse({
    userId: formData.get("userId"),
    weekday: formData.get("weekday"),
    start: formData.get("start"),
    end: formData.get("end"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos" };
  }

  const targetUser = await prisma.user.findFirst({
    where: { id: parsed.data.userId, accountId: session.user.accountId },
  });
  if (!targetUser) {
    return { error: "Profissional não encontrado" };
  }

  const startMinute = timeLabelToMinutes(parsed.data.start);
  const endMinute = timeLabelToMinutes(parsed.data.end);

  if (endMinute <= startMinute) {
    return { error: "O horário final deve ser depois do inicial" };
  }

  await prisma.availability.create({
    data: {
      accountId: session.user.accountId,
      userId: targetUser.id,
      weekday: parsed.data.weekday,
      startMinute,
      endMinute,
    },
  });

  revalidatePath("/app/configuracoes");
  return { success: true };
}

export async function deleteAvailabilityRule(ruleId: string) {
  const session = await requireOwner();

  await prisma.availability.deleteMany({
    where: { id: ruleId, accountId: session.user.accountId },
  });

  revalidatePath("/app/configuracoes");
}
