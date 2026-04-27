# Assistente de Marketing AI (Next.js)

Interface em Next.js para um assistente de IA de marketing com:

- Geração de título, legenda, hashtags, horário sugerido, prompt visual e arte.
- Preview com ações: regenerar arte, regenerar legenda, ajustar data/hora e aprovar/agendar.
- Planejador/calendário lendo posts reais (Supabase).
- Integração Meta para conexão da conta e publicação manual (`Publicar agora`).
- Refinamento conversacional: após gerar, continue no mesmo campo para ajustar legenda/arte e use o botão "Criar nova postagem" para iniciar outro fluxo.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variáveis de ambiente

Crie `.env.local`:

```bash
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Banco de dados (Supabase)

Rode o SQL em `supabase/schema.sql` no SQL Editor do projeto Supabase.

## Observações

- Sem Supabase configurado, o app salva agendamentos em `localStorage` **somente como fallback de teste local**.
- Publicação automática (cron/worker) não foi implementada nesta etapa.
