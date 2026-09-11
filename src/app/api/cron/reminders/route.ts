import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAppointmentWhatsApp } from "@/lib/whatsapp";

/**
 * Dispara lembretes de WhatsApp para agendamentos confirmados que
 * acontecem entre 23h e 25h a partir de agora. Deve ser chamado
 * periodicamente (ex: a cada 30-60min) por um agendador externo
 * (cron-job.org, Vercel Cron, cron da VPS via curl).
 *
 * Protegido por CRON_SECRET — chame com `?secret=<CRON_SECRET>` ou
 * header `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 500 });
  }

  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (provided !== secret) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      startAt: { gte: windowStart, lte: windowEnd },
      notifications: { none: { type: "REMINDER", channel: "WHATSAPP" } },
    },
    include: { client: true, service: true, account: true },
    take: 200,
  });

  let sent = 0;
  let failed = 0;

  for (const appointment of appointments) {
    const result = await notifyAppointmentWhatsApp({
      accountId: appointment.accountId,
      appointmentId: appointment.id,
      type: "REMINDER",
      clientName: appointment.client.name,
      clientPhone: appointment.client.phone,
      accountName: appointment.account.name,
      serviceName: appointment.service.name,
      startAt: appointment.startAt,
    });
    if (result.ok) sent++;
    else failed++;
  }

  return NextResponse.json({ checked: appointments.length, sent, failed });
}
