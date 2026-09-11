"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type CancelState = { error?: string; success?: boolean };

export async function cancelOwnAppointment(
  token: string,
  appointmentId: string
): Promise<CancelState> {
  const client = await prisma.client.findUnique({ where: { portalToken: token } });
  if (!client) return { error: "Não encontrado" };

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: appointmentId,
      clientId: client.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { gt: new Date() },
    },
  });
  if (!appointment) return { error: "Agendamento não encontrado" };

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELED" },
  });

  revalidatePath(`/cliente/${token}`);
  return { success: true };
}

const anamnesisSchema = z.object({
  allergies: z.string().optional(),
  skinNailConditions: z.string().optional(),
  medications: z.string().optional(),
  pregnantOrBreastfeeding: z.string().optional(),
  diabetes: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
});

export type AnamnesisState = { error?: string; success?: boolean };

export async function saveOwnAnamnesis(
  token: string,
  _prevState: AnamnesisState,
  formData: FormData
): Promise<AnamnesisState> {
  const client = await prisma.client.findUnique({ where: { portalToken: token } });
  if (!client) return { error: "Não encontrado" };

  const parsed = anamnesisSchema.safeParse({
    allergies: formData.get("allergies") || undefined,
    skinNailConditions: formData.get("skinNailConditions") || undefined,
    medications: formData.get("medications") || undefined,
    pregnantOrBreastfeeding: formData.get("pregnantOrBreastfeeding") || undefined,
    diabetes: formData.get("diabetes") || undefined,
    preferences: formData.get("preferences") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: "Dados inválidos" };
  }

  await prisma.anamnesis.upsert({
    where: { clientId: client.id },
    create: {
      clientId: client.id,
      allergies: parsed.data.allergies || null,
      skinNailConditions: parsed.data.skinNailConditions || null,
      medications: parsed.data.medications || null,
      pregnantOrBreastfeeding: parsed.data.pregnantOrBreastfeeding === "on",
      diabetes: parsed.data.diabetes === "on",
      preferences: parsed.data.preferences || null,
      notes: parsed.data.notes || null,
    },
    update: {
      allergies: parsed.data.allergies || null,
      skinNailConditions: parsed.data.skinNailConditions || null,
      medications: parsed.data.medications || null,
      pregnantOrBreastfeeding: parsed.data.pregnantOrBreastfeeding === "on",
      diabetes: parsed.data.diabetes === "on",
      preferences: parsed.data.preferences || null,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath(`/cliente/${token}`);
  return { success: true };
}
