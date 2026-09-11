"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

const staffSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export type StaffState = { error?: string; success?: boolean };

export async function createStaff(
  _prevState: StaffState,
  formData: FormData
): Promise<StaffState> {
  const session = await requireOwner();

  const parsed = staffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe um usuário com este e-mail" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: "STAFF",
      accountId: session.user.accountId,
    },
  });

  revalidatePath("/app/colaboradores");
  return { success: true };
}

export async function toggleStaffActive(userId: string) {
  const session = await requireOwner();

  const staff = await prisma.user.findFirst({
    where: { id: userId, accountId: session.user.accountId, role: "STAFF" },
  });
  if (!staff) return;

  await prisma.user.update({
    where: { id: staff.id },
    data: { active: !staff.active },
  });

  revalidatePath("/app/colaboradores");
}

export async function toggleStaffBookable(userId: string) {
  const session = await requireOwner();

  const staff = await prisma.user.findFirst({
    where: { id: userId, accountId: session.user.accountId, role: "STAFF" },
  });
  if (!staff) return;

  await prisma.user.update({
    where: { id: staff.id },
    data: { bookable: !staff.bookable },
  });

  revalidatePath("/app/colaboradores");
}

export async function deleteStaff(userId: string) {
  const session = await requireOwner();

  await prisma.user.deleteMany({
    where: { id: userId, accountId: session.user.accountId, role: "STAFF" },
  });

  revalidatePath("/app/colaboradores");
}
