"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const registerSchema = z.object({
  accountName: z.string().min(2, "Informe o nome do salão/profissional"),
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export type RegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerAccount(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse({
    accountName: formData.get("accountName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { accountName, name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail" };
  }

  const baseSlug = slugify(accountName) || "salao";
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.account.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.account.create({
    data: {
      name: accountName,
      slug,
      users: {
        create: {
          name,
          email: normalizedEmail,
          passwordHash,
        },
      },
    },
  });

  return { success: true };
}
