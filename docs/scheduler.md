# Agendamento automático

O OfferMiner usa dois endpoints protegidos para funcionar com Supabase Cron e Vercel:

- `POST /api/cron/start-mining`: reserva pesquisas vencidas e inicia os Actors da Apify.
- `POST /api/cron/check-runs`: consulta runs pendentes, baixa os Datasets concluídos e salva as ofertas.
- `POST /api/cron/mining`: executa as duas etapas na mesma chamada, útil para testes.

Todas as chamadas exigem `x-cron-secret` ou `Authorization: Bearer ...` com o valor de `CRON_SECRET`. O servidor nunca aceita esses endpoints sem o segredo configurado.

## Variáveis do servidor

```env
CRON_SECRET=um-segredo-aleatorio-com-pelo-menos-16-caracteres
SCHEDULER_BATCH_SIZE=2
SCHEDULER_CHECK_BATCH_SIZE=10
```

## Migration

Execute `supabase/migrations/00002_scheduler.sql` depois da migration inicial. Ela permite o estado `running`, a frequência `twice_daily` e cria os índices para pesquisas vencidas e runs pendentes.

## Jobs no Supabase Cron

Depois que o projeto estiver publicado na Vercel, crie dois Jobs no Supabase Cron. Substitua `https://SEU-DOMINIO.vercel.app` pela URL real e armazene o segredo no Vault ou na configuração segura do projeto:

```sql
select cron.schedule(
  'offerminer-start-mining',
  '*/10 * * * *',
  $$ select net.http_post(
    url := 'https://SEU-DOMINIO.vercel.app/api/cron/start-mining',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','SEU_CRON_SECRET'),
    body := '{"limit":2}'::jsonb
  ) as request_id; $$
);

select cron.schedule(
  'offerminer-check-runs',
  '*/10 * * * *',
  $$ select net.http_post(
    url := 'https://SEU-DOMINIO.vercel.app/api/cron/check-runs',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret','SEU_CRON_SECRET'),
    body := '{"limit":10}'::jsonb
  ) as request_id; $$
);
```

Não use o mesmo segredo diretamente no SQL versionado. Prefira Supabase Vault ou configure os Jobs pelo Dashboard. Os dois Jobs são chamados a cada dez minutos, mas somente pesquisas com `status = active` e `next_execution_at <= now()` são executadas. Cada pesquisa volta a ser elegível após sua própria frequência; `twice_daily` agenda doze horas depois.

## Fluxo e segurança

Cada reserva muda a pesquisa para `running`, cria um registro em `search_runs` e guarda somente o ID do run e a posição do token Apify. O token nunca é gravado no banco. Runs concluídos são processados pelo segundo Job. Falhas liberam a pesquisa e são gravadas em `search_runs`.

O endpoint não mantém uma requisição aberta esperando a Apify terminar. Isso evita o timeout de funções serverless e permite distribuir as 70 pesquisas em lotes pequenos.
