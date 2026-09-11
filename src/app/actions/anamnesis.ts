"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const anamnesisSchema = z.object({
  clientId: z.string().min(1),
  allergies: z.string().optional(),
  skinNailConditions: z.string().optional(),
  medications: z.string().optional(),
  pregnantOrBreastfeeding: z.string().optional(),
  diabetes: z.string().optional(),
  preferences: z.string().optional(),
  notes: z.string().optional(),
});

export type AnamnesisState = { error?: string; success?: boolean };

export async function saveClientAnamnesis(
  _prevState: AnamnesisState,
  formData: FormData
): Promise<AnamnesisState> {
  const session = await requireSession();

  const parsed = anamnesisSchema.safeParse({
    clientId: formData.get("clientId"),
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

  const client = await prisma.client.findFirst({
    where: { id: parsed.data.clientId, accountId: session.user.accountId },
  });
  if (!client) return { error: "Cliente não encontrado" };

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

  revalidatePath(`/app/clientes/${client.id}`);
  return { success: true };
}
