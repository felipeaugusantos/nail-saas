"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

const serviceSchema = z.object({
  name: z.string().min(2, "Informe o nome do serviço"),
  durationMin: z.coerce.number().int().positive("Duração inválida"),
  priceCents: z.coerce.number().int().nonnegative("Preço inválido"),
});

export type ServiceState = { error?: string; success?: boolean };

export async function createService(
  _prevState: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const session = await requireOwner();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    durationMin: formData.get("durationMin"),
    priceCents: Math.round(Number(formData.get("price")) * 100),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.service.create({
    data: {
      ...parsed.data,
      accountId: session.user.accountId,
    },
  });

  revalidatePath("/app/servicos");
  return { success: true };
}

export async function toggleServiceActive(serviceId: string) {
  const session = await requireOwner();

  const service = await prisma.service.findFirst({
    where: { id: serviceId, accountId: session.user.accountId },
  });
  if (!service) return;

  await prisma.service.update({
    where: { id: service.id },
    data: { active: !service.active },
  });

  revalidatePath("/app/servicos");
}

export async function deleteService(serviceId: string) {
  const session = await requireOwner();

  await prisma.service.deleteMany({
    where: { id: serviceId, accountId: session.user.accountId },
  });

  revalidatePath("/app/servicos");
}
