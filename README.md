# Nail SAAS

SAAS de gestão para salões de nail design (manicure/nail designer): agendamento online, colaboradores, financeiro e estoque. Cada conta é isolada (multi-tenant): o dono cadastra serviços, colaboradores e disponibilidade, e compartilha uma página pública (`/{slug}`) onde as clientes agendam e pagam online.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5) com login por credenciais e papéis (dono/colaborador)
- Stripe Checkout para pagamento (opcional em dev — sem chave configurada, o agendamento confirma direto)
- Resend para e-mail de confirmação (opcional em dev)
- Twilio (WhatsApp) para confirmação e lembrete automático de agendamento (opcional em dev)

## Rodando localmente

1. Suba o Postgres local via Docker:

   ```bash
   docker compose up -d
   ```

2. Copie `.env.example` para `.env` (já existe um `.env` de desenvolvimento pronto) e ajuste as variáveis se necessário.

3. Instale as dependências e aplique as migrations:

   ```bash
   npm install
   npx prisma migrate dev
   ```

4. Rode o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse [http://localhost:3000](http://localhost:3000).

## Fluxo principal

1. Dono cria conta em `/registrar` (gera um slug único, ex: `/studio-unhas-da-ana`).
2. Em `/app/servicos` cadastra os serviços (nome, duração, preço).
3. Em `/app/colaboradores` cadastra colaboradores (cada um ganha login próprio e pode ser marcado como reservável na página pública).
4. Em `/app/configuracoes` cada profissional (dono ou colaborador) configura seus horários de disponibilidade e bloqueios pontuais (feriados, férias).
5. Compartilha o link público `/{slug}` com as clientes.
6. Cliente final escolhe o profissional (se houver mais de um reservável), o serviço, data e horário livre, informa nome/telefone/e-mail e confirma.
   - Se `STRIPE_SECRET_KEY` estiver configurada, é redirecionada para o Stripe Checkout; o webhook confirma o agendamento após o pagamento.
   - Sem Stripe configurado, o agendamento é confirmado direto (útil para testes locais).
   - Em ambos os casos, é disparada uma mensagem de WhatsApp de confirmação (se o Twilio estiver configurado).
7. O profissional acompanha e gerencia os agendamentos em `/app/agenda` (lista ou visão semanal) — colaboradores só veem os próprios agendamentos.
8. O dono acompanha receita/despesas em `/app/financeiro` e o estoque de produtos em `/app/estoque`.

## Lembretes automáticos de WhatsApp

O endpoint `GET /api/cron/reminders?secret=<CRON_SECRET>` verifica agendamentos confirmados que acontecem entre 23h e 25h a partir do momento da chamada e dispara um lembrete de WhatsApp (uma única vez por agendamento). Ele **não roda sozinho** — precisa ser chamado periodicamente (a cada 30-60min) por um agendador externo:

- **Vercel Cron** (`vercel.json`) se o deploy for na Vercel.
- Um cron na própria VPS: `curl -s "https://seu-dominio/api/cron/reminders?secret=$CRON_SECRET"`.
- Um serviço como [cron-job.org](https://cron-job.org).

## Variáveis de ambiente

Veja `.env.example` para a lista completa (banco de dados, Auth.js, Stripe, Resend, Twilio/WhatsApp, `CRON_SECRET`).

## Próximos passos

- Cobrança de sinal (parcial) via PIX.
- Área do cliente (histórico, cancelamento/remarcação própria).
- Ficha de anamnese, pacotes de serviços, comissão de colaboradores.
- Planos de assinatura pagos para o próprio SAAS.
