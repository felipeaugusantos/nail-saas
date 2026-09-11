import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendAppointmentConfirmationEmail(params: {
  to: string;
  clientName: string;
  accountName: string;
  serviceName: string;
  startAt: Date;
}) {
  if (!resend || !process.env.EMAIL_FROM) return;

  const dateLabel = params.startAt.toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: params.to,
    subject: `Agendamento confirmado em ${params.accountName}`,
    html: `
      <p>Olá, ${params.clientName}!</p>
      <p>Seu agendamento em <strong>${params.accountName}</strong> foi confirmado:</p>
      <ul>
        <li><strong>Serviço:</strong> ${params.serviceName}</li>
        <li><strong>Data/hora:</strong> ${dateLabel}</li>
      </ul>
      <p>Até breve!</p>
    `,
  });
}
