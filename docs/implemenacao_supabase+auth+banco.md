Quero implementar Supabase no projeto OfferMiner, adicionando:

1. Autenticação de usuários.
2. Persistência em PostgreSQL.
3. Isolamento de dados por usuário com Row Level Security.
4. Migração gradual da persistência JSON existente.
5. Documentação completa em `docs/`.

Antes de modificar qualquer arquivo, analise o repositório inteiro e confirme a arquitetura atual. O código é a fonte de verdade. Não confie em informações antigas do README.

## Contexto do produto

O OfferMiner é uma plataforma de mineração e análise de ofertas comerciais anunciadas na Meta Ads Library.

O usuário:

1. Seleciona um nicho.
2. Pode informar uma palavra-chave adicional.
3. Cria uma pesquisa monitorada.
4. Executa a coleta por meio da Apify.
5. O backend transforma anúncios em ofertas.
6. As ofertas são agrupadas por página de vendas.
7. O catálogo exibe criativos, anúncios ativos, ticket, página de vendas, domínio, funil e sinais de escala.

Não é uma plataforma para anúncios políticos, eleitorais ou sociais.

## Stack atual

Frontend:

- React 19
- TypeScript
- Vite 8
- React Router
- TanStack React Query
- Tailwind CSS
- Lucide React
- Motion
- Recharts

Backend:

- Node.js
- Express
- TypeScript
- Vite SSR para build do servidor
- API REST
- Porta local 3010
- Integração com Apify no backend

Persistência atual:

- `server/data/catalog.json`
- `server/data/searches.json`
- Favoritos no `localStorage`

Arquivos importantes:

- `src/App.tsx`
- `src/routes/AppRoutes.tsx`
- `src/services/offersService.ts`
- `src/hooks/useOffers.ts`
- `src/types/offer.ts`
- `src/types/search.ts`
- `src/config/niches.ts`
- `server/index.ts`
- `server/store.ts`
- `server/apifyClient.ts`
- `server/nicheQueries.ts`
- `server/transformAds.ts`
- `server/import-apify.ts`

## Objetivo desta implementação

Substituir a persistência principal em JSON e `localStorage` por Supabase, mantendo o frontend e a integração com Apify funcionando.

Cada usuário autenticado deve acessar somente:

- Suas pesquisas monitoradas.
- Suas ofertas descobertas.
- Seus favoritos.
- Suas execuções de mineração.
- Seus dados de perfil.

A implementação deve funcionar localmente e estar preparada para futura publicação.

## Regras obrigatórias

1. Não exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend.
2. Não envie tokens da Apify ao navegador.
3. Use apenas a chave pública/publishable do Supabase no frontend.
4. Operações administrativas devem acontecer somente no backend.
5. Todas as tabelas com dados do usuário precisam de RLS.
6. Não desative RLS para fazer a aplicação funcionar.
7. Não use uma única policy genérica sem avaliar cada operação.
8. Não coloque segredos em arquivos versionados.
9. Preserve o design atual.
10. Preserve a integração existente com Apify.
11. Preserve os 70 nichos e o gerador de até 96 consultas.
12. Não execute uma coleta paga durante a implementação.
13. Não apague os arquivos JSON existentes.
14. Não substitua dados reais por mocks.
15. Não invente recursos de assinatura ou cobrança.
16. Use migrations SQL versionadas.
17. Documente todas as decisões em `docs/`.
18. Valide tudo com TypeScript e build completo.

## Arquitetura esperada

Use Supabase Auth no frontend para gerenciar sessão e identidade.

O backend Express deve validar o JWT recebido do frontend antes de permitir operações protegidas.

Fluxo esperado:

1. O usuário entra pelo Supabase Auth.
2. O frontend recebe uma sessão.
3. O frontend envia `Authorization: Bearer <access_token>` para a API Express.
4. O backend valida o token com o Supabase.
5. O backend obtém o `user.id` validado.
6. Todas as consultas ao banco são vinculadas a esse usuário.
7. Nenhum `user_id` fornecido pelo navegador deve ser considerado confiável.
8. O servidor define o proprietário dos registros com base no JWT validado.

Não aceite autenticação baseada apenas em um ID enviado no body, query string ou header personalizado.

## Autenticação

Implemente inicialmente:

- Cadastro com e-mail e senha.
- Login com e-mail e senha.
- Logout.
- Persistência da sessão.
- Recuperação de senha.
- Atualização de senha.
- Tratamento de e-mail não confirmado, caso a confirmação esteja habilitada.
- Redirecionamento após autenticação.
- Proteção das rotas internas.
- Estado de carregamento enquanto a sessão é recuperada.
- Mensagens de erro em português.
- Página ou rota para callback de autenticação, se necessária.

Crie as páginas:

- `/login`
- `/cadastro`
- `/esqueci-a-senha`
- `/redefinir-senha`

Proteja:

- `/dashboard`
- `/ofertas`
- `/ofertas/:id`
- `/favoritos`
- `/pesquisas`
- `/configuracoes`

Usuários autenticados que acessarem `/login` ou `/cadastro` devem ser redirecionados para `/dashboard`.

Crie um contexto ou provider de autenticação bem tipado, por exemplo:

- `AuthProvider`
- `useAuth`
- `ProtectedRoute`
- `PublicOnlyRoute`

Não espalhe chamadas diretas de autenticação por componentes sem uma camada central.

## Configuração do Supabase

Crie clientes separados:

### Frontend

Use somente variáveis públicas do Vite:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Ou use a nomenclatura atual recomendada pela versão instalada do Supabase, documentando a escolha.

### Backend

Use:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

A service role deve existir apenas no processo do servidor.

Se for possível executar as consultas do backend respeitando o JWT do usuário, prefira isso. Use service role somente para operações que realmente exigirem privilégio administrativo.

Atualize:

- `.env.example`
- documentação de instalação
- validação de variáveis de ambiente

Nunca escreva valores reais de chaves nos arquivos versionados.

## Modelo de banco

Crie migrations em uma pasta como:

`supabase/migrations/`

Use UUID, timestamps com timezone e chaves estrangeiras.

### 1. `profiles`

Campos sugeridos:

- `id uuid primary key references auth.users(id) on delete cascade`
- `display_name text`
- `avatar_url text`
- `default_country text default 'BR'`
- `created_at timestamptz`
- `updated_at timestamptz`

Crie uma função e trigger para gerar o perfil após o cadastro.

### 2. `monitored_searches`

Representa as pesquisas monitoradas.

Campos mínimos:

- `id uuid primary key`
- `user_id uuid not null`
- `name text not null`
- `keyword text`
- `niche text not null`
- `queries jsonb not null default '[]'`
- `country text not null default 'BR'`
- `status text not null`
- `ad_status text not null default 'ACTIVE'`
- `results_count integer not null default 0`
- `identified_offers_count integer not null default 0`
- `last_executed_at timestamptz`
- `next_execution_at timestamptz`
- `frequency text not null`
- `limit_results integer not null`
- `created_at timestamptz`
- `updated_at timestamptz`

Crie constraints para status, frequência e limite.

### 3. `search_runs`

Registra cada execução de mineração.

Campos mínimos:

- `id uuid primary key`
- `user_id uuid not null`
- `search_id uuid not null`
- `status text not null`
- `provider text default 'apify'`
- `provider_run_id text`
- `token_slot integer`
- `query_count integer`
- `requested_limit integer`
- `raw_ads_count integer`
- `identified_offers_count integer`
- `error_code text`
- `error_message text`
- `started_at timestamptz`
- `finished_at timestamptz`
- `created_at timestamptz`

Nunca armazene o conteúdo do token.

Status sugeridos:

- `queued`
- `running`
- `succeeded`
- `failed`
- `timed_out`
- `cancelled`

### 4. `offers`

Preserve os campos do tipo `Offer` existente.

Campos relacionais importantes:

- `id uuid primary key`
- `user_id uuid not null`
- `slug text not null`
- `name text not null`
- `summary text`
- `niche text`
- `country text`
- `language text`
- `status text`
- `funnel_type text`
- `has_vsl boolean`
- `ticket numeric`
- `currency text`
- `active_ads_count integer`
- `unique_creatives_count integer`
- `oldest_active_ad_days integer`
- `ads_change_last_7_days integer`
- `scale_score integer`
- `sales_page_url text`
- `sales_page_domain text`
- `page_technology text`
- `keywords jsonb`
- `platforms jsonb`
- `creative_formats jsonb`
- `key_promises jsonb`
- `scale_evidences jsonb`
- `meta_library_search_url text`
- `first_seen_at timestamptz`
- `last_checked_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Crie uma restrição única coerente por usuário. Avalie se deve ser:

- `(user_id, slug)`
- `(user_id, sales_page_domain, slug)`

Escolha com base no agrupamento atual em `transformAds.ts` e documente a decisão.

### 5. `offer_advertisers`

Campos:

- `id uuid primary key`
- `user_id uuid not null`
- `offer_id uuid not null`
- `external_page_id text`
- `name text`
- `avatar_url text`
- `verified boolean`
- `category text`
- `ads_count integer`
- `created_at timestamptz`
- `updated_at timestamptz`

### 6. `offer_creatives`

Campos:

- `id uuid primary key`
- `user_id uuid not null`
- `offer_id uuid not null`
- `external_creative_id text`
- `type text`
- `thumbnail_url text`
- `media_url text`
- `title text`
- `body text`
- `ads_using_count integer`
- `first_seen_at timestamptz`
- `duration text`
- `aspect_ratio text`
- `carousel_cards_count integer`
- `created_at timestamptz`
- `updated_at timestamptz`

### 7. `offer_ads`

Campos:

- `id uuid primary key`
- `user_id uuid not null`
- `offer_id uuid not null`
- `external_ad_id text`
- `library_id text`
- `library_url text`
- `advertiser_page_id text`
- `advertiser_page_name text`
- `body text`
- `title text`
- `call_to_action text`
- `start_date timestamptz`
- `is_active boolean`
- `platforms jsonb`
- `creative_external_id text`
- `destination_url text`
- `created_at timestamptz`
- `updated_at timestamptz`

Evite duplicar o mesmo anúncio para o mesmo usuário.

### 8. `offer_history`

Campos:

- `id uuid primary key`
- `user_id uuid not null`
- `offer_id uuid not null`
- `observed_at timestamptz`
- `active_ads integer`
- `unique_creatives integer`
- `ticket numeric`
- `scale_score integer`
- `created_at timestamptz`

Crie uma chave ou índice que evite duplicação acidental da mesma observação.

### 9. `favorites`

Campos:

- `user_id uuid not null`
- `offer_id uuid not null`
- `created_at timestamptz`
- chave primária composta `(user_id, offer_id)`

Substitua o sistema atual de favoritos em `localStorage`.

### 10. Relação entre pesquisa e oferta

Crie `search_offers`:

- `search_id uuid not null`
- `offer_id uuid not null`
- `user_id uuid not null`
- `first_matched_at timestamptz`
- `last_matched_at timestamptz`
- chave primária coerente para impedir duplicações

Essa tabela deverá substituir a dependência principal de `matchedOfferSlugs` e permitir que “Ver ofertas” mostre apenas as ofertas encontradas pela pesquisa selecionada.

## Decisão sobre normalização

Antes de criar as tabelas, examine o volume e o acesso esperado.

Use tabelas relacionais para:

- Pesquisas.
- Execuções.
- Ofertas.
- Anúncios.
- Criativos.
- Anunciantes.
- Histórico.
- Favoritos.
- Relações entre pesquisa e oferta.

Use JSONB somente para pequenos arrays ou atributos que não precisam de consultas relacionais frequentes.

Não armazene toda a estrutura `Offer` em um único JSONB sem justificar.

## Row Level Security

Ative RLS em todas as tabelas com dados de usuário.

Crie policies para que:

- Usuário possa ler apenas linhas cujo `user_id = auth.uid()`.
- Usuário possa inserir apenas linhas próprias.
- Usuário possa atualizar apenas linhas próprias.
- Usuário possa excluir apenas linhas próprias.
- `profiles.id` seja protegido por `auth.uid()`.
- Relações filhas não possam apontar para uma oferta de outro usuário.
- `search_runs` não seja manipulável por outro usuário.

Considere que várias tabelas possuem `user_id` redundante para facilitar RLS. Garanta consistência com constraints, triggers ou validações no backend.

Documente cada policy.

Inclua testes SQL ou instruções manuais para verificar que:

1. Usuário A não enxerga registros do usuário B.
2. Usuário A não consegue inserir registros para o usuário B.
3. Usuário A não consegue favoritar oferta do usuário B.
4. Um usuário não consegue associar uma oferta a uma pesquisa de outro usuário.

## Camada de acesso a dados

Não espalhe consultas Supabase por toda a aplicação.

Crie uma camada organizada, por exemplo:

Frontend:

- `src/lib/supabase.ts`
- `src/context/AuthContext.tsx`
- `src/services/authService.ts`
- adaptação de `src/services/offersService.ts`

Backend:

- `server/supabase.ts`
- `server/authMiddleware.ts`
- `server/repositories/searchRepository.ts`
- `server/repositories/offerRepository.ts`
- `server/repositories/runRepository.ts`

Os nomes podem mudar se a arquitetura atual indicar uma organização melhor.

Mantenha:

- Tipos centralizados.
- Mapeamento explícito entre `snake_case` do banco e `camelCase` do frontend.
- Tratamento uniforme de erros.
- APIs compatíveis com os componentes atuais sempre que possível.

Não force os componentes a conhecer o formato interno das tabelas.

## Middleware de autenticação do backend

Crie um middleware que:

1. Leia o header `Authorization`.
2. Exija o formato Bearer.
3. Valide o JWT com Supabase.
4. Disponibilize o usuário autenticado no request.
5. Retorne `401` para sessão ausente ou inválida.
6. Retorne mensagens seguras, sem detalhes internos.
7. Nunca aceite `user_id` do body como identidade.

Proteja todos os endpoints de dados.

`GET /api/health` pode continuar público, mas sua resposta não deve revelar:

- Tokens.
- Valores de chaves.
- E-mails.
- Dados de conta Apify.
- Informações sensíveis do ambiente.

## Endpoints

Mantenha ou adapte:

- `GET /api/health`
- `GET /api/offers`
- `GET /api/offers/:id`
- `GET /api/searches`
- `POST /api/searches`
- `PATCH /api/searches/:id/status`
- `POST /api/searches/:id/run`

Adicione quando necessário:

- `PATCH /api/searches/:id`
- `DELETE /api/searches/:id`
- `GET /api/searches/:id/runs`
- `GET /api/searches/:id/offers`
- `POST /api/offers/:id/favorite`
- `DELETE /api/offers/:id/favorite`
- `GET /api/favorites`
- `GET /api/profile`
- `PATCH /api/profile`

Todas as operações precisam usar o usuário obtido do token validado.

## Fluxo de coleta com banco

Ao executar uma pesquisa:

1. Validar o usuário.
2. Confirmar que a pesquisa pertence ao usuário.
3. Impedir execução simultânea da mesma pesquisa.
4. Criar um registro `search_runs` com status `running`.
5. Gerar novamente as consultas pelo backend.
6. Executar o Actor da Apify.
7. Registrar o ID do run da Apify.
8. Baixar o Dataset.
9. Transformar os anúncios.
10. Fazer upsert transacional ou consistente de:
    - oferta;
    - anunciante;
    - criativos;
    - anúncios;
    - histórico;
    - relação entre pesquisa e oferta.
11. Atualizar métricas da pesquisa.
12. Marcar `search_runs` como `succeeded`.
13. Em caso de falha, registrar erro sanitizado e marcar como `failed`.
14. Sempre retirar a pesquisa do estado `running`.

Se não for possível usar uma única transação por meio do cliente Supabase, crie uma função RPC no PostgreSQL ou documente a estratégia de consistência adotada.

Não deixe dados parcialmente associados silenciosamente.

## Migração dos dados JSON

Os arquivos existentes não devem ser apagados.

Crie um script de migração manual e idempotente, por exemplo:

`server/migrate-json-to-supabase.ts`

O script deve:

- Receber explicitamente o ID ou e-mail do usuário proprietário.
- Ler `catalog.json` e `searches.json`.
- Validar os dados.
- Converter IDs antigos para UUIDs ou manter um campo `legacy_id`.
- Fazer upsert.
- Migrar relações entre pesquisas e ofertas quando possível.
- Registrar quantos itens foram criados, atualizados, ignorados ou falharam.
- Poder ser executado novamente sem duplicar dados.
- Não rodar automaticamente na inicialização.
- Não apagar os JSONs depois da importação.
- Exigir confirmação explícita ou opção `--dry-run`.

Documente exatamente como utilizar o script.

## Compatibilidade com a interface

Preserve:

- Dashboard.
- Catálogo de ofertas.
- Filtros.
- Detalhes da oferta.
- Pesquisas monitoradas.
- Favoritos.
- Toasts.
- Layout escuro.
- Responsividade.
- Estados de carregamento.

Atualize a interface para:

- Exibir o usuário autenticado.
- Permitir logout.
- Mostrar avatar ou iniciais.
- Remover dados pessoais hardcoded.
- Mostrar estados vazios por usuário.
- Tratar sessão expirada.
- Redirecionar ao login quando a API retornar `401`.

Não deixe nomes, e-mails, plano ou avatar fictícios na interface autenticada.

A seção de assinatura pode permanecer claramente marcada como futura ou ser ocultada até existir uma implementação real.

## Favoritos

Migre favoritos de `localStorage` para a tabela `favorites`.

Durante a transição, implemente uma migração opcional:

1. Após o primeiro login, detectar IDs antigos no `localStorage`.
2. Tentar migrar somente ofertas pertencentes ao usuário.
3. Remover a chave local apenas após sucesso.
4. Marcar que a migração já aconteceu.
5. Não criar favoritos para ofertas inexistentes ou de outro usuário.

Documente esse comportamento.

## Paginação

Como o banco será introduzido agora, prepare os endpoints de listagem para paginação.

`GET /api/offers` deve aceitar, de forma validada:

- `page`
- `pageSize`
- `search`
- `niche`
- `country`
- `language`
- `creativeFormat`
- `funnelType`
- `hasVsl`
- `status`
- `minTicket`
- `maxTicket`
- `minAgeDays`
- `minAdsCount`
- `minCreativesCount`
- `platform`
- `pageTechnology`
- `sortBy`
- `searchId`
- `onlyFavorites`

Retorne metadados como:

- `items`
- `total`
- `page`
- `pageSize`
- `totalPages`
- opções disponíveis para filtros, se necessário

Adapte React Query e a interface sem quebrar a experiência atual.

Não carregue indefinidamente o catálogo inteiro no navegador.

## Índices

Crie índices coerentes para:

- `user_id`
- `search_id`
- `offer_id`
- `status`
- `niche`
- `country`
- `last_checked_at`
- `scale_score`
- `active_ads_count`
- `sales_page_domain`
- IDs externos de anúncios e criativos
- relacionamentos
- favoritos

Considere índice para busca textual em:

- nome.
- resumo.
- domínio.
- anunciante.
- texto do anúncio.

Se usar `pg_trgm` ou full-text search, inclua a extensão e documente a estratégia.

Evite índices redundantes.

## Timestamps

Implemente uma função `updated_at` reutilizável no PostgreSQL e associe às tabelas editáveis.

Use `timestamptz`.

No frontend, continue formatando datas para `pt-BR`.

## Tipagem

Se possível, gere tipos do Supabase e salve em um arquivo versionado, por exemplo:

`src/types/database.ts`

Não use `any` para dados do banco sem necessidade.

Mantenha os tipos de domínio existentes e crie mappers entre banco e domínio.

## Erros e observabilidade

Padronize erros da API.

Formato sugerido:

{
  "message": "Mensagem segura para o usuário",
  "code": "SEARCH_NOT_FOUND"
}

Não retorne:

- Stack traces.
- SQL.
- JWT.
- Chaves.
- Tokens Apify.
- Informações internas do Supabase.

Registre no servidor:

- Request.
- Usuário por ID, quando apropriado.
- Operação.
- Duração.
- ID da execução.
- Resultado.
- Erro sanitizado.

Nunca registre access token, refresh token ou senha.

## Documentação obrigatória

Crie a pasta `docs/` caso não exista.

Produza:

### `docs/README.md`

Índice da documentação.

### `docs/architecture.md`

- Arquitetura frontend/backend/Supabase/Apify.
- Responsabilidades de cada camada.
- Diagrama Mermaid.
- Fluxo de autenticação.
- Fluxo de mineração.

### `docs/supabase-setup.md`

- Como criar ou conectar o projeto Supabase.
- Variáveis de ambiente.
- Como aplicar migrations.
- Configuração de URLs de redirect.
- Desenvolvimento local.
- Produção.
- Como gerar tipos.

### `docs/database-schema.md`

- Tabelas.
- Campos.
- Relacionamentos.
- Constraints.
- Índices.
- Diagrama ER em Mermaid.
- Decisões de normalização.

### `docs/authentication.md`

- Cadastro.
- Login.
- Logout.
- Recuperação de senha.
- Renovação de sessão.
- Proteção das rotas.
- Validação no backend.
- Tratamento de sessão expirada.

### `docs/rls-policies.md`

- Todas as policies.
- O motivo de cada policy.
- Exemplos de testes com dois usuários.

### `docs/data-migration.md`

- Migração de JSON.
- Migração de favoritos.
- Dry run.
- Rollback.
- Verificação pós-migração.

### `docs/api.md`

- Endpoints.
- Headers.
- Parâmetros.
- Payloads.
- Respostas.
- Erros.
- Paginação.

### `docs/development.md`

- Instalação.
- Comandos.
- Estrutura do projeto.
- Como iniciar o servidor.
- Como validar.
- Como diagnosticar erros.

### `docs/security.md`

- Onde ficam os segredos.
- Diferença entre chave pública e service role.
- RLS.
- Proteção de tokens Apify.
- Logs.
- Checklist para produção.

Atualize também o `README.md` principal com uma visão breve e links para `docs/`.

## Testes mínimos

Implemente testes relevantes para:

1. Middleware de autenticação.
2. Usuário sem token recebe `401`.
3. Usuário não acessa dados de outro usuário.
4. Criação de pesquisa associa o usuário correto.
5. Execução só aceita pesquisa pertencente ao usuário.
6. Favoritos pertencem ao usuário.
7. Filtros e paginação.
8. Upsert de oferta.
9. Deduplicação de anúncios e criativos.
10. Migração idempotente.
11. Erro da Apify atualiza corretamente `search_runs`.
12. Logout e rota protegida.
13. Sessão expirada.

Não escreva testes que apenas repitam a implementação sem verificar comportamento.

## Sequência de trabalho

Trabalhe nesta ordem:

### Fase 1 — Auditoria

- Analise o repositório.
- Identifique dependências, rotas, serviços e tipos.
- Liste inconsistências.
- Não altere arquivos durante a auditoria.

### Fase 2 — Plano

Apresente:

- Arquivos que serão criados.
- Arquivos que serão alterados.
- Modelo do banco.
- Estratégia de autenticação.
- Estratégia de migração.
- Riscos.
- Critérios de aceite.

### Fase 3 — Banco

- Instale dependências.
- Crie migrations.
- Crie RLS.
- Crie índices.
- Gere ou defina tipos.

### Fase 4 — Autenticação

- Cliente frontend.
- Provider.
- Páginas.
- Rotas protegidas.
- Middleware backend.
- Sessão e logout.

### Fase 5 — Persistência

- Repositórios.
- Endpoints.
- Ofertas.
- Pesquisas.
- Histórico.
- Favoritos.
- Execuções.

### Fase 6 — Migração

- Script JSON.
- Migração de favoritos.
- Dry run.
- Documentação.

### Fase 7 — Interface

- Perfil real.
- Estados vazios.
- Sessão expirada.
- Paginação.
- Erros.

### Fase 8 — Validação

Execute:

- TypeScript.
- Testes.
- Build do frontend.
- Build do backend.
- Verificação das migrations.
- Verificação das policies.

### Fase 9 — Documentação

- Produza todos os arquivos em `docs/`.
- Atualize o README.
- Confirme que nenhum segredo foi incluído.

## Critérios de aceite

A implementação só estará concluída quando:

- Cadastro, login, logout e recuperação de senha funcionarem.
- Rotas internas exigirem autenticação.
- O backend validar o JWT.
- Usuários estiverem isolados por RLS.
- Pesquisas forem persistidas no Supabase.
- Ofertas forem persistidas no Supabase.
- Execuções forem registradas.
- Favoritos não dependerem mais de `localStorage`.
- “Ver ofertas” funcionar por relação com a pesquisa.
- Listagens tiverem paginação.
- A integração Apify continuar exclusivamente no backend.
- Nenhum segredo chegar ao frontend.
- Os JSONs antigos permanecerem preservados.
- Existir um script de migração idempotente.
- TypeScript, testes e builds passarem.
- A documentação em `docs/` estiver completa.

## Como começar

Comece exclusivamente pela Fase 1.

Faça a auditoria e apresente o plano detalhado antes de modificar o código. Depois da auditoria, implemente todas as fases em sequência, registrando em `docs/implementation-progress.md`:

- Fase.
- Alterações.
- Arquivos.
- Testes realizados.
- Resultado.
- Pendências reais.

Quando encontrar uma decisão ambígua, prefira a opção mais simples, segura e compatível com o código atual. Não invente dados ou alegue que algo foi testado quando não foi possível testá-lo.