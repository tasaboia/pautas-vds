# Central de Pautas de Oração

Projeto em Next.js para:
- receber itens públicos de pauta
- revisar itens internamente
- montar cada um dos 40 dias com 3 a 6 itens
- exportar cada dia concluído em DOCX

## Setup

```bash
npm install
cp .env.example .env
npx prisma db push
npm run dev
```

## Variáveis

- `DATABASE_URL`: PostgreSQL/Neon
- `AUTH_SECRET`: segredo do Auth.js
- `AUTH_GOOGLE_ID` e `AUTH_GOOGLE_SECRET`: OAuth Google
- `AUTHORIZED_ORGANIZER_EMAILS`: emails autorizados para a área interna

## Rotas principais

- `/` envio público
- `/organizar` painel interno
- `/api/export/day/:numero` exportação DOCX do dia

## Estrutura do produto

- **PrayerItem**: item individual enviado pelo público
- **PrayerDay**: um dos 40 dias
- **DayItem**: composição de um item dentro de um dia com ordem editorial
