# Nail SAAS

SAAS de agendamento para profissionais autônomos e salões de nail design (manicure/nail designer). Cada conta é isolada (multi-tenant): a cliente cadastra seus serviços, configura horários de disponibilidade e compartilha uma página pública (`/{slug}`) onde suas clientes agendam e pagam online.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5) com login por credenciais
- Stripe Checkout para pagamento (opcional em dev — sem chave configurada, o agendamento confirma direto)
- Resend para e-mail de confirmação (opcional em dev)

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

1. Profissional cria conta em `/registrar` (gera um slug único, ex: `/studio-unhas-da-ana`).
2. Em `/app/servicos` cadastra os serviços (nome, duração, preço).
3. Em `/app/configuracoes` define os horários de disponibilidade por dia da semana.
4. Compartilha o link público `/{slug}` com as clientes.
5. Cliente final escolhe serviço, data e horário livre, informa nome/telefone/e-mail e confirma.
   - Se `STRIPE_SECRET_KEY` estiver configurada, é redirecionada para o Stripe Checkout; o webhook confirma o agendamento após o pagamento.
   - Sem Stripe configurado, o agendamento é confirmado direto (útil para testes locais).
6. O profissional acompanha e gerencia os agendamentos em `/app/agenda`.

## Variáveis de ambiente

Veja `.env.example` para a lista completa (banco de dados, Auth.js, Stripe, Resend).

## Próximos passos (fora do MVP)

- Integração com WhatsApp Cloud API para lembretes.
- Múltiplos funcionários por conta/salão.
- Planos de assinatura pagos para o próprio SAAS.
- Relatórios financeiros.
