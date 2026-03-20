# Central de Pautas de Oração

Projeto em **Next.js (App Router)** com cara de ferramenta interna profissional, mas com fluxo simples:

- **Área pública** para qualquer pessoa cadastrar pautas
- **Área interna** para organizadores revisarem, selecionarem dias e exportarem o material para a Tami

## O que esta versão entrega

### Área pública
- formulário limpo e rápido
- categoria, tipo de oração, idioma, pauta e referência bíblica
- observação opcional

### Área interna
- login com Google
- dashboard com indicadores principais
- fila editorial com filtros
- edição de texto final aprovado
- observações internas
- definição de status, dia e ordem
- visão de planejamento por dia
- bloco de exportação pronto para copiar e enviar à Tami

## Stack

- Next.js
- Auth.js / `next-auth@beta`
- Prisma
- PostgreSQL (Neon funciona muito bem)

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o `.env` com algo assim:

```env
DATABASE_URL="postgresql://USER:SENHA@HOST/DB?sslmode=require"
AUTH_SECRET="sua-chave-segura"
AUTH_GOOGLE_ID="seu-google-client-id"
AUTH_GOOGLE_SECRET="seu-google-client-secret"
AUTHORIZED_ORGANIZER_EMAILS="voce@gmail.com,outraorganizadora@gmail.com"
NEXTAUTH_URL="http://localhost:3000"
```

3. Gere o Prisma e sincronize o schema:

```bash
npx prisma generate
npx prisma db push
```

4. Rode o projeto:

```bash
npm run dev
```

Abra: `http://localhost:3000`

## Configuração do Google OAuth

Na credencial OAuth do Google, adicione este callback em desenvolvimento:

```text
http://localhost:3000/api/auth/callback/google
```

Em produção:

```text
https://SEU-DOMINIO.com/api/auth/callback/google
```

## Observações

- Se `AUTHORIZED_ORGANIZER_EMAILS` ficar vazio, qualquer conta Google poderá entrar na área interna.
- Ao cadastrar uma pauta, o sistema já copia o texto enviado para `textoFinal`, para facilitar a revisão.
- O schema está configurado para PostgreSQL, então combina com Neon sem precisar mudar a lógica do app.

## Ideias de próximos upgrades

- exportação em CSV ou PDF
- anexos e comentários por pauta
- score de prioridade editorial
- painel separado de “prontas para arte”
- trilha de auditoria de alterações
