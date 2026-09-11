"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendAppointmentConfirmationEmail } from "@/lib/email";
import { notifyAppointmentWhatsApp } from "@/lib/whatsapp";

const bookingSchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startAt: z.string().min(1),
  clientName: z.string().min(2, "Informe seu nome"),
  clientPhone: z.string().min(8, "Informe um telefone válido"),
  clientEmail: z.string().email().optional().or(z.literal("")),
});

export type BookingState = {
  error?: string;
  redirectUrl?: string;
};

export async function createPublicAppointment(
  _prevState: BookingState,
  formData: FormData
): Promise<BookingState> {
  const parsed = bookingSchema.safeParse({
    slug: formData.get("slug"),
    serviceId: formData.get("serviceId"),
    staffId: formData.get("staffId"),
    startAt: formData.get("startAt"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    clientEmail: formData.get("clientEmail") || "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const {
    slug,
    serviceId,
    staffId,
    startAt,
    clientName,
    clientPhone,
    clientEmail,
  } = parsed.data;

  const account = await prisma.account.findUnique({ where: { slug } });
  if (!account) return { error: "Salão não encontrado" };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, accountId: account.id, active: true },
  });
  if (!service) return { error: "Serviço não encontrado" };

  const staff = await prisma.user.findFirst({
    where: { id: staffId, accountId: account.id, bookable: true, active: true },
  });
  if (!staff) return { error: "Profissional não encontrado" };

  const start = new Date(startAt);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
    return { error: "Horário inválido" };
  }
  const end = new Date(start.getTime() + service.durationMin * 60000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      accountId: account.id,
      staffId: staff.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { lt: end },
      endAt: { gt: start },
    },
  });
  if (conflict) {
    return { error: "Este horário acabou de ser reservado. Escolha outro." };
  }

  const dayStart = new Date(start);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  const startMinute = start.getHours() * 60 + start.getMinutes();
  const endMinute = startMinute + service.durationMin;

  const blocks = await prisma.timeBlock.findMany({
    where: { accountId: account.id, userId: staff.id, date: { gte: dayStart, lt: dayEnd } },
  });
  const isBlocked = blocks.some((b) => {
    if (b.startMinute == null || b.endMinute == null) return true;
    return startMinute < b.endMinute && endMinute > b.startMinute;
  });
  if (isBlocked) {
    return { error: "Este horário não está mais disponível. Escolha outro." };
  }

  let client = await prisma.client.findFirst({
    where: { accountId: account.id, phone: clientPhone },
  });
  if (!client) {
    client = await prisma.client.create({
      data: {
        accountId: account.id,
        name: clientName,
        phone: clientPhone,
        email: clientEmail || null,
      },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      accountId: account.id,
      clientId: client.id,
      serviceId: service.id,
      staffId: staff.id,
      startAt: start,
      endAt: end,
      priceCents: service.priceCents,
      status: stripe ? "PENDING" : "CONFIRMED",
      depositPaid: !stripe,
    },
  });

  if (!stripe) {
    if (clientEmail) {
      await sendAppointmentConfirmationEmail({
        to: clientEmail,
        clientName,
        accountName: account.name,
        serviceName: service.name,
        startAt: start,
      });
    }
    await notifyAppointmentWhatsApp({
      accountId: account.id,
      appointmentId: appointment.id,
      type: "CONFIRMATION",
      clientName,
      clientPhone,
      accountName: account.name,
      serviceName: service.name,
      startAt: start,
    });
    return { redirectUrl: `/agendamento/confirmado?id=${appointment.id}` };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: { name: `${service.name} - ${account.name}` },
          unit_amount: service.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/agendamento/confirmado?id=${appointment.id}`,
    cancel_url: `${appUrl}/agendamento/cancelado?id=${appointment.id}`,
    metadata: { appointmentId: appointment.id },
  });

  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      amountCents: service.priceCents,
      status: "PENDING",
      stripePaymentIntentId: checkoutSession.id,
    },
  });

  return { redirectUrl: checkoutSession.url ?? undefined };
}
