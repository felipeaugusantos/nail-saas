import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendAppointmentConfirmationEmail } from "@/lib/email";
import { notifyAppointmentWhatsApp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature ?? "",
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = session.metadata?.appointmentId;

    if (appointmentId) {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "CONFIRMED", depositPaid: true },
        include: { client: true, service: true, account: true },
      });

      await prisma.payment.updateMany({
        where: { appointmentId },
        data: { status: "PAID" },
      });

      if (appointment.client.email) {
        await sendAppointmentConfirmationEmail({
          to: appointment.client.email,
          clientName: appointment.client.name,
          accountName: appointment.account.name,
          serviceName: appointment.service.name,
          startAt: appointment.startAt,
        });
      }

      await notifyAppointmentWhatsApp({
        accountId: appointment.accountId,
        appointmentId: appointment.id,
        type: "CONFIRMATION",
        clientName: appointment.client.name,
        clientPhone: appointment.client.phone,
        accountName: appointment.account.name,
        serviceName: appointment.service.name,
        startAt: appointment.startAt,
      });
    }
  }

  return NextResponse.json({ received: true });
}
