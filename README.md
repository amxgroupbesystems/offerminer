# OfferMiner

Minerador de ofertas comerciais da Meta Ads Library. O usuário escolhe um nicho, o servidor gera combinações de pesquisas low ticket, executa o coletor da Apify e agrupa os anúncios por página de venda. O sistema agora conta com **autenticação e banco de dados relacional** através do Supabase, suportando múltiplos usuários de forma segura.

## Configuração

1. Execute `npm install`.
2. Copie `.env.example` para `.env.local` (ou `.env`).
3. Preencha as credenciais da **Apify**:
   - `APIFY_TOKEN_1` (ou mais, dependendo do rotation configurado).
   - `APIFY_ACTOR_ID=jmlp/meta-ad-library-scraper`
4. Preencha as credenciais do **Supabase**:
   - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (utilizadas no frontend).
   - `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (utilizadas no backend para chamadas administrativas).
5. Execute `npm run dev`.

A aplicação e a API usam, por padrão, a porta `3010` (definida no `PORT`).

## Funcionalidades e Fluxo

- **Autenticação Segura**: Suporte a criação de conta, login e recuperação de senha. Rotas da aplicação (Dashboard, Mineração, Favoritos) são protegidas e os dados são isolados por usuário utilizando Row Level Security (RLS) no banco de dados.
- **Pesquisas Monitoradas**: Crie uma rotina selecionando o nicho. O backend expande o nicho em múltiplas consultas, combinando termos do mercado com padrões "low ticket" e formatos específicos.
- **Mineração**: O botão **Executar agora** chama a Apify, agrupa anúncios pelo destino, deduplica criativos e calcula os sinais de escala. O token da Apify nunca é exposto ao navegador.
- **Persistência PostgreSQL**: O sistema mapeia os dados do JSON legado e grava no banco de dados, vinculando ofertas, anunciantes, anúncios e pesquisas ao ID do usuário ativo.

## Importação manual (Via script)

`npm run import:apify -- "C:\\caminho\\dataset.json" "Educação" "keyword usada"`

*(Lembre-se de verificar se as lógicas de importação manual estão conectadas à nova persistência do Supabase ou migrar adequadamente).*

## Migração do Legado (JSON -> Supabase)

Para importar os antigos arquivos `catalog.json` e `searches.json` salvos no repositório para a nuvem sob um usuário específico, execute:
```bash
npx tsx scripts/migrate-json-to-supabase.ts <USER_ID_AQUI>
```
*Dica: use `--dry-run` ao final para simular a migração sem efetuar alterações no banco.*

## Comandos

- `npm run dev`: compila o servidor e abre o Vite com a API.
- `npm run build`: compila frontend e servidor.
- `npm run start`: executa a compilação de produção a partir do `dist`.
- `npm run lint`: valida o TypeScript.
