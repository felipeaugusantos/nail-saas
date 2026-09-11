"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";
import { timeLabelToMinutes } from "@/lib/availability";

const timeBlockSchema = z
  .object({
    userId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida"),
    wholeDay: z.string().optional(),
    start: z.string().optional(),
    end: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine(
    (data) => data.wholeDay === "on" || (data.start && data.end),
    { message: "Informe o horário de início e fim, ou marque o dia inteiro" }
  );

export type TimeBlockState = { error?: string; success?: boolean };

export async function createTimeBlock(
  _prevState: TimeBlockState,
  formData: FormData
): Promise<TimeBlockState> {
  const session = await requireOwner();

  const parsed = timeBlockSchema.safeParse({
    userId: formData.get("userId"),
    date: formData.get("date"),
    wholeDay: formData.get("wholeDay") || undefined,
    start: formData.get("start") || undefined,
    end: formData.get("end") || undefined,
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const targetUser = await prisma.user.findFirst({
    where: { id: parsed.data.userId, accountId: session.user.accountId },
  });
  if (!targetUser) {
    return { error: "Profissional não encontrado" };
  }

  const isWholeDay = parsed.data.wholeDay === "on";
  let startMinute: number | null = null;
  let endMinute: number | null = null;

  if (!isWholeDay) {
    startMinute = timeLabelToMinutes(parsed.data.start!);
    endMinute = timeLabelToMinutes(parsed.data.end!);
    if (endMinute <= startMinute) {
      return { error: "O horário final deve ser depois do inicial" };
    }
  }

  await prisma.timeBlock.create({
    data: {
      accountId: session.user.accountId,
      userId: targetUser.id,
      date: new Date(`${parsed.data.date}T00:00:00`),
      startMinute,
      endMinute,
      reason: parsed.data.reason || null,
    },
  });

  revalidatePath("/app/configuracoes");
  return { success: true };
}

export async function deleteTimeBlock(blockId: string) {
  const session = await requireOwner();

  await prisma.timeBlock.deleteMany({
    where: { id: blockId, accountId: session.user.accountId },
  });

  revalidatePath("/app/configuracoes");
}
