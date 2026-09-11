import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const serviceId = searchParams.get("serviceId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD

  if (!slug || !serviceId || !dateStr) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { slug } });
  if (!account) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, accountId: account.id, active: true },
  });
  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }

  const slots = await getAvailableSlots(account.id, date, service.durationMin);

  return NextResponse.json({
    slots: slots.map((s) => s.toISOString()),
  });
}
