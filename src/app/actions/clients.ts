"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const clientSchema = z.object({
  name: z.string().min(2, "Informe o nome do cliente"),
  phone: z.string().min(8, "Informe um telefone válido"),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type ClientState = { error?: string; success?: boolean };

export async function createClient(
  _prevState: ClientState,
  formData: FormData
): Promise<ClientState> {
  const session = await requireSession();

  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    notes: formData.get("notes") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { name, phone, email, notes } = parsed.data;

  await prisma.client.create({
    data: {
      name,
      phone,
      email: email || null,
      notes: notes || null,
      accountId: session.user.accountId,
    },
  });

  revalidatePath("/app/clientes");
  return { success: true };
}

export async function deleteClient(clientId: string) {
  const session = await requireSession();

  await prisma.client.deleteMany({
    where: { id: clientId, accountId: session.user.accountId },
  });

  revalidatePath("/app/clientes");
}
