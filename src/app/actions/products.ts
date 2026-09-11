"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/session";

const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  sku: z.string().optional(),
  unit: z.string().min(1).max(10),
  costCents: z.coerce.number().int().nonnegative(),
  priceCents: z.coerce.number().int().nonnegative(),
  lowStockAlert: z.coerce.number().int().nonnegative(),
});

export type ProductState = { error?: string; success?: boolean };

export async function createProduct(
  _prevState: ProductState,
  formData: FormData
): Promise<ProductState> {
  const session = await requireOwner();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    unit: formData.get("unit") || "un",
    costCents: Math.round(Number(formData.get("cost") || 0) * 100),
    priceCents: Math.round(Number(formData.get("price") || 0) * 100),
    lowStockAlert: formData.get("lowStockAlert") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      accountId: session.user.accountId,
    },
  });

  revalidatePath("/app/estoque");
  return { success: true };
}

export async function toggleProductActive(productId: string) {
  const session = await requireOwner();

  const product = await prisma.product.findFirst({
    where: { id: productId, accountId: session.user.accountId },
  });
  if (!product) return;

  await prisma.product.update({
    where: { id: product.id },
    data: { active: !product.active },
  });

  revalidatePath("/app/estoque");
}

export async function deleteProduct(productId: string) {
  const session = await requireOwner();

  await prisma.product.deleteMany({
    where: { id: productId, accountId: session.user.accountId },
  });

  revalidatePath("/app/estoque");
}

const movementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().nonnegative(),
  reason: z.string().optional(),
});

export type MovementState = { error?: string; success?: boolean };

export async function createStockMovement(
  _prevState: MovementState,
  formData: FormData
): Promise<MovementState> {
  const session = await requireOwner();

  const parsed = movementSchema.safeParse({
    productId: formData.get("productId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { productId, type, quantity, reason } = parsed.data;

  const product = await prisma.product.findFirst({
    where: { id: productId, accountId: session.user.accountId },
  });
  if (!product) return { error: "Produto não encontrado" };

  let newQty = product.stockQty;
  if (type === "IN") newQty = product.stockQty + quantity;
  else if (type === "OUT") newQty = product.stockQty - quantity;
  else newQty = quantity;

  if (newQty < 0) {
    return { error: "Estoque insuficiente para essa saída" };
  }

  await prisma.$transaction([
    prisma.product.update({
      where: { id: product.id },
      data: { stockQty: newQty },
    }),
    prisma.stockMovement.create({
      data: {
        accountId: session.user.accountId,
        productId: product.id,
        type,
        quantity: type === "ADJUSTMENT" ? Math.abs(newQty - product.stockQty) : quantity,
        reason,
      },
    }),
  ]);

  revalidatePath("/app/estoque");
  return { success: true };
}
