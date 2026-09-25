import './env';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Offer } from '../src/types/offer.ts';
import type { MonitoredSearch } from '../src/types/search.ts';
import { buildNicheQueries } from './nicheQueries.ts';
import { getApifyIntegrationStatus, runApifyCollection } from './apifyClient.ts';
import { isStoredOfferEligible, transformAdsToOffers } from './transformAds.ts';
import { keepValidatedLowTicketOffers } from './landingPageClassifier.ts';
import { readJson, writeJson } from './store.ts';
import { requireAuth, AuthenticatedRequest } from './authMiddleware.ts';
import { SearchesRepository } from './repositories/searchesRepository.ts';
import { OffersRepository } from './repositories/offersRepository.ts';
import { FavoritesRepository } from './repositories/favoritesRepository.ts';
import { finishPendingMining, startDueMining } from './scheduler.ts';


export const app = express();
const port = Number(process.env.PORT || 3010);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () =>
    console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} ${Date.now() - startedAt}ms`)
  );
  next();
});

// JSON fallback functions (usados se Supabase nÃ£o estiver configurado)
const isSupabaseConfigured = Boolean(
  (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const offersJson = () => readJson<Offer[]>('catalog.json', []);
const searchesJson = () => readJson<MonitoredSearch[]>('searches.json', []);
function requireCronSecret(req: express.Request,res: express.Response): boolean {
  const expected=process.env.CRON_SECRET?.trim();
  if(!expected){res.status(503).json({message:'CRON_SECRET nÃ£o configurado.'});return false;}
  const supplied=req.header('x-cron-secret')||req.header('authorization')?.replace(/^Bearer\s+/i,'');
  if(supplied!==expected){res.status(401).json({message:'Cron nÃ£o autorizado.'});return false;}
  return true;
}

app.post('/api/cron/start-mining', async (req,res)=>{
  if(!requireCronSecret(req,res))return;
  try{res.json(await startDueMining(Number(req.body?.limit)||Number(process.env.SCHEDULER_BATCH_SIZE)||2));}
  catch(error){console.error('[CRON] falha ao iniciar pesquisas',error);res.status(500).json({message:'Falha ao iniciar pesquisas vencidas.'});}
});

app.post('/api/cron/check-runs', async (req,res)=>{
  if(!requireCronSecret(req,res))return;
  try{res.json(await finishPendingMining(Number(req.body?.limit)||Number(process.env.SCHEDULER_CHECK_BATCH_SIZE)||10));}
  catch(error){console.error('[CRON] falha ao verificar execuÃ§Ãµes',error);res.status(500).json({message:'Falha ao verificar execuÃ§Ãµes pendentes.'});}
});

app.post('/api/cron/mining', async (req,res)=>{
  if(!requireCronSecret(req,res))return;
  try{
    const completed=await finishPendingMining(Number(process.env.SCHEDULER_CHECK_BATCH_SIZE)||10);
    const started=await startDueMining(Number(process.env.SCHEDULER_BATCH_SIZE)||2);
    res.json({completed,started});
  }catch(error){console.error('[CRON] falha no ciclo',error);res.status(500).json({message:'Falha no ciclo automÃ¡tico.'});}
});

// Health Check Endpoint (PÃºblico)
app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    supabase: isSupabaseConfigured,
    apify: getApifyIntegrationStatus(),
  })
);

// Favoritos Endpoints (Protegidos)
app.get('/api/favorites', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isSupabaseConfigured && req.user?.id) {
      const favs = await FavoritesRepository.getUserFavorites(req.user.id);
      return res.json(favs);
    }
    res.json([]);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/favorites/:offerId/toggle', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isSupabaseConfigured && req.user?.id) {
      const isFavorite = await FavoritesRepository.toggleFavorite(req.user.id, req.params.offerId);
      return res.json({ isFavorite });
    }
    res.json({ isFavorite: false });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Offers Endpoints (Protegidos)
app.get('/api/offers', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isSupabaseConfigured && req.user?.id) {
      const dbOffers = await OffersRepository.getUserOffers(req.user.id);
      if (dbOffers.length > 0) {
        return res.json(dbOffers.filter(isStoredOfferEligible));
      }
    }
    // Fallback JSON para visualizaÃ§Ã£o de dados legados se banco vazio ou nÃ£o configurado
    const list = await offersJson();
    res.json(list.filter(isStoredOfferEligible));
  } catch (error: any) {
    console.error('[API] Erro ao buscar ofertas:', error);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/offers/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isSupabaseConfigured && req.user?.id) {
      const item = await OffersRepository.getByIdOrSlug(req.params.id, req.user.id);
      if (item && isStoredOfferEligible(item)) return res.json(item);
    }

    const list = await offersJson();
    const item = list.find((o) => o.id === req.params.id || o.slug === req.params.id);
    if (item && isStoredOfferEligible(item)) return res.json(item);

    res.status(404).json({ message: 'Oferta nÃ£o encontrada' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Searches Endpoints (Protegidos)
app.get('/api/searches', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isSupabaseConfigured && req.user?.id) {
      const dbSearches = await SearchesRepository.getUserSearches(req.user.id);
      if (dbSearches.length > 0) {
        return res.json(dbSearches);
      }
    }
    const list = await searchesJson();
    res.json(list);
  } catch (error: any) {
    console.error('[API] Erro ao buscar pesquisas:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/searches', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const niche = String(req.body.niche || req.body.name || '').trim();
    if (!niche) return res.status(400).json({ message: 'Informe o nicho da pesquisa.' });
    const queries = buildNicheQueries(niche, req.body.keyword);

    if (isSupabaseConfigured && req.user?.id) {
      const created = await SearchesRepository.create(req.user.id, req.body, queries);
      return res.status(201).json(created);
    }

    const now = new Date();
    const item: MonitoredSearch = {
      id: `search-${Date.now()}`,
      name: req.body.name || niche,
      keyword: req.body.keyword || '',
      niche,
      queries,
      country: req.body.country || 'BR',
      status: 'active',
      adStatus: 'ACTIVE',
      resultsCount: 0,
      identifiedOffersCount: 0,
      lastExecutedAt: '',
      nextExecutionAt: now.toISOString(),
      frequency: req.body.frequency || 'daily',
      limitResults: Math.max(1, Math.min(Number(req.body.limitResults) || 1000, 1000)),
      createdAt: now.toISOString(),
    };
    const list = await searchesJson();
    await writeJson('searches.json', [item, ...list]);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/searches/:id/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (isSupabaseConfigured && req.user?.id) {
      const current = await SearchesRepository.getById(req.params.id, req.user.id);
      if (!current) return res.status(404).json({ message: 'Pesquisa nÃ£o encontrada' });
      const nextStatus = current.status === 'paused' ? 'active' : 'paused';
      const updated = await SearchesRepository.updateStatus(req.params.id, req.user.id, nextStatus);
      return res.json(updated);
    }

    const list = await searchesJson();
    const found = list.find((s) => s.id === req.params.id);
    if (!found) return res.status(404).json({ message: 'Pesquisa nÃ£o encontrada' });
    found.status = found.status === 'paused' ? 'active' : 'paused';
    await writeJson('searches.json', list);
    res.json(found);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/searches/:id/run', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  try {
    let search: MonitoredSearch | null = null;
    let list: MonitoredSearch[] = [];

    if (isSupabaseConfigured && userId) {
      search = await SearchesRepository.getById(req.params.id, userId);
    } else {
      list = await searchesJson();
      search = list.find((s) => s.id === req.params.id) || null;
    }

    if (!search) return res.status(404).json({ message: 'Pesquisa nÃ£o encontrada' });
    if (search.status === 'running') {
      return res
        .status(409)
        .json({ message: 'Esta pesquisa jÃ¡ estÃ¡ sendo executada. Aguarde a conclusÃ£o antes de iniciar novamente.' });
    }

    // Atualizar status para running no fallback JSON (o Supabase bloqueia via constraint e o estado React resolve na UI)
    if (!isSupabaseConfigured || !userId) {
      search.status = 'running';
      await writeJson('searches.json', list);
    }

    const queries = buildNicheQueries(search.niche || search.name, search.keyword);
    search.queries = queries;

    console.log(
      `[MINERACAO] Inicio search=${search.id} nicho=${JSON.stringify(
        search.niche || search.name
      )} pais=${search.country} consultas=${queries.length} limite=${search.limitResults}`
    );

    const raw = await runApifyCollection({
      queries,
      country: search.country,
      resultsPerQuery: search.limitResults,
    });

    const candidates = transformAdsToOffers(
      raw,
      search.niche || search.name,
      queries,
      new Date(),
      search.keyword
    );
    const fresh = await keepValidatedLowTicketOffers(candidates);
    console.log(`[FILTRO LOW TICKET] candidatos=${candidates.length} aprovados=${fresh.length} rejeitados=${candidates.length-fresh.length}`);

    if (isSupabaseConfigured && userId) {
      // Salvar ofertas no Supabase
      await OffersRepository.saveBatch(userId, fresh);
      // Atualizar pesquisa no Supabase
      const updatedSearch = await SearchesRepository.updateRunResults(
        search.id,
        userId,
        raw.length,
        fresh.length,
        search.frequency
      );
      console.log(`[MINERACAO BD] Concluida search=${search.id} anuncios=${raw.length} ofertas=${fresh.length}`);
      return res.json({ search: updatedSearch, rawAdsCount: raw.length, offersCount: fresh.length });
    }

    // Fallback JSON
    const current = await offersJson();
    const merged = new Map(current.map((o) => [o.id, o]));
    for (const offer of fresh) {
      const previous = merged.get(offer.id);
      if (previous) {
        offer.history = [
          ...previous.history.filter((h) => h.date !== offer.history[0].date),
          ...offer.history,
        ];
        offer.firstSeenAt = previous.firstSeenAt;
        offer.adsChangeLast7Days = offer.activeAdsCount - previous.activeAdsCount;
      }
      merged.set(offer.id, offer);
    }
    await writeJson('catalog.json', [...merged.values()]);

    const now = new Date();
    search.status = 'active';
    search.resultsCount = raw.length;
    search.identifiedOffersCount = fresh.length;
    search.lastExecutedAt = now.toISOString();
    search.nextExecutionAt = new Date(
      now.getTime() +
        (search.frequency === 'hourly'
          ? 3600000
          : search.frequency === 'twice_daily'
          ? 43200000
          : search.frequency === 'weekly'
          ? 604800000
          : 86400000)
    ).toISOString();
    search.matchedOfferSlugs = fresh.map((o) => o.slug);
    await writeJson('searches.json', list);

    console.log(`[MINERACAO JSON] Concluida search=${search.id} anuncios=${raw.length} ofertas=${fresh.length}`);
    res.json({ search, rawAdsCount: raw.length, offersCount: fresh.length });
  } catch (error: any) {
    if (isSupabaseConfigured && userId) {
      await SearchesRepository.updateStatus(req.params.id, userId, 'active');
    } else {
      const list = await searchesJson();
      const search = list.find((s) => s.id === req.params.id);
      if (search) {
        search.status = 'active';
        await writeJson('searches.json', list);
      }
    }
    console.error(`[MINERACAO] Falha search=${req.params.id}:`, error instanceof Error ? error.message : error);
    res.status(500).json({ message: error instanceof Error ? error.message : 'Falha desconhecida' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(root, 'dist')));
  app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist/index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
}

if (!process.env.VERCEL) {
  app.listen(port, '0.0.0.0', () => console.log(`OfferMiner em http://localhost:${port}`));
}

export default app;

