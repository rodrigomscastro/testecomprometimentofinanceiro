# Teste de Comprometimento Financeiro

Plataforma para aplicar o **Teste de Status/Comprometimento Financeiro** a uma plateia.

- **Administrador**: faz login, cria eventos e gera um **link exclusivo + QR code** para divulgar.
- **Plateia**: acessa o link no celular, responde a um perfil + 10 perguntas e vê o **resultado na hora** (Verde / Amarelo / Vermelho).
- **Admin**: acompanha, por evento, o **resultado agregado**, **gráficos** e exporta um **CSV**.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL · NextAuth · Recharts · qrcode.

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o `.env.example` para `.env` e ajuste os valores:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: string de conexão PostgreSQL.
   - `NEXTAUTH_SECRET`: segredo aleatório (`openssl rand -base64 32`).
   - `NEXTAUTH_URL`: URL pública (em produção, ex.: `https://seuapp.vercel.app`).
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`: credenciais do administrador.

3. Crie as tabelas e o usuário admin:

   ```bash
   npx prisma migrate dev
   npm run seed
   ```

4. Inicie o servidor:

   ```bash
   npm run dev
   ```

   - Painel: <http://localhost:3000/admin>
   - Link público de cada evento: `http://localhost:3000/t/<publicId>`

## Pontuação

Cada pergunta vale: **A = 10**, **B = 5**, **C = 0** (máximo 100).

| Pontuação | Resultado | Cor |
| --------- | --------- | --- |
| > 50      | Superendividado | Vermelho |
| 25 a 50   | Endividado | Amarelo |
| 0 a 24    | Mandou Bem! | Verde |

> O documento original deixa uma lacuna entre 21–24; aqui ela é incorporada ao Verde (`score < 25`). Para alterar a regra, edite `categoryForScore` em `lib/quiz.ts`.

## Deploy na Vercel

1. Crie um banco PostgreSQL (Vercel Postgres, Neon ou Supabase) e copie a `DATABASE_URL`.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. Após o primeiro deploy, aplique as migrações e o seed apontando para o banco de produção:

   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

   (Pode ser feito localmente com a `DATABASE_URL` de produção no `.env`.)

## Estrutura

- `lib/quiz.ts` — perguntas, pontuação e faixas de resultado.
- `lib/profile.ts` — perguntas de perfil e validação.
- `lib/aggregate.ts` — agregações para os gráficos.
- `app/t/[publicId]` — fluxo público do teste.
- `app/admin` — painel (login, lista de eventos, detalhe com QR/gráficos/CSV).
- `app/api` — APIs de autenticação, eventos, envio e exportação.
