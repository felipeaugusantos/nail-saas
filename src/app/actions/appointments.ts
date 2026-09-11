"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]);

export async function updateAppointmentStatus(
  appointmentId: string,
  status: z.infer<typeof statusSchema>
) {
  const session = await requireSession();
  const parsedStatus = statusSchema.parse(status);

  await prisma.appointment.updateMany({
    where: { id: appointmentId, accountId: session.user.accountId },
    data: { status: parsedStatus },
  });

  revalidatePath("/app/agenda");
}
