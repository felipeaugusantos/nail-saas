import twilio from "twilio";
import { prisma } from "@/lib/prisma";

const client =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

/**
 * Normaliza um telefone brasileiro para o formato E.164 (+55...).
 * Aceita entradas com ou sem DDI/formatação: "(11) 91234-5678", "11912345678".
 */
export function toE164BR(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("55") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  return null;
}

export async function sendWhatsAppMessage(
  toPhone: string,
  body: string
): Promise<{ ok: boolean; error?: string }> {
  if (!client || !process.env.TWILIO_WHATSAPP_FROM) {
    return { ok: false, error: "WhatsApp não configurado" };
  }

  const to = toE164BR(toPhone);
  if (!to) {
    return { ok: false, error: "Telefone inválido" };
  }

  try {
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro desconhecido" };
  }
}

/**
 * Envia (se configurado) a mensagem de WhatsApp de confirmação ou lembrete
 * de um agendamento e registra o resultado em Notification.
 */
export async function notifyAppointmentWhatsApp(params: {
  accountId: string;
  appointmentId: string;
  type: "CONFIRMATION" | "REMINDER";
  clientName: string;
  clientPhone: string;
  accountName: string;
  serviceName: string;
  startAt: Date;
  portalUrl: string;
}) {
  const dateLabel = params.startAt.toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const body =
    params.type === "CONFIRMATION"
      ? `Olá, ${params.clientName}! Seu agendamento em *${params.accountName}* foi confirmado.\n\nServiço: ${params.serviceName}\nData: ${dateLabel}\n\nVeja seu histórico ou cancele/remarque aqui: ${params.portalUrl}\n\nAté breve! 💅`
      : `Olá, ${params.clientName}! Passando pra lembrar do seu agendamento em *${params.accountName}* amanhã.\n\nServiço: ${params.serviceName}\nData: ${dateLabel}\n\nPrecisa cancelar ou remarcar? ${params.portalUrl}\n\nNos vemos em breve! 💅`;

  const result = await sendWhatsAppMessage(params.clientPhone, body);

  await prisma.notification.create({
    data: {
      accountId: params.accountId,
      appointmentId: params.appointmentId,
      channel: "WHATSAPP",
      type: params.type,
      status: result.ok ? "SENT" : "FAILED",
      message: result.ok ? body : (result.error ?? "Falha ao enviar"),
    },
  });

  return result;
}
