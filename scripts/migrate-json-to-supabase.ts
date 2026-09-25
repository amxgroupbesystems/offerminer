import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import type { Offer } from '../src/types/offer';
import type { MonitoredSearch } from '../src/types/search';

dotenv.config({ path: ['.env.local', '.env'] });

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('[ERRO] Supabase admin credentials (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) não configuradas.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  try {
    const data = await fs.readFile(path.join(root, 'server', 'data', filename), 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

async function runMigration() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const targetUserId = args.find(a => !a.startsWith('--'));

  console.log(`\n=== Mapeamento de JSON para Supabase ===`);
  console.log(`Modo: ${isDryRun ? 'DRY-RUN (Simulação)' : 'REAL (Produção)'}`);
  
  if (!targetUserId) {
    console.error('\n[ERRO] É necessário informar o ID do usuário de destino como argumento.');
    console.error('Exemplo: npx tsx scripts/migrate-json-to-supabase.ts <USER_ID>');
    console.error('Para simulação: npx tsx scripts/migrate-json-to-supabase.ts <USER_ID> --dry-run');
    process.exit(1);
  }

  console.log(`Destino User ID: ${targetUserId}`);

  // Validação do usuário
  const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
  if (userError || !user) {
    console.error(`\n[ERRO] Usuário com ID ${targetUserId} não encontrado no Supabase.`);
    process.exit(1);
  }

  console.log(`\nLendo dados legados...`);
  const catalog = await readJson<Offer[]>('catalog.json', []);
  const searches = await readJson<MonitoredSearch[]>('searches.json', []);

  console.log(`Encontradas: ${catalog.length} Ofertas, ${searches.length} Pesquisas.`);

  if (isDryRun) {
    console.log('\n[DRY RUN] Simulação concluída com sucesso. Nenhum dado foi alterado no banco de dados.');
    process.exit(0);
  }

  // MIGRAR PESQUISAS
  console.log('\nMigrando Pesquisas Monitoradas...');
  for (const search of searches) {
    const dbPayload = {
      user_id: targetUserId,
      name: search.name || search.niche,
      keyword: search.keyword || '',
      niche: search.niche,
      queries: search.queries || [],
      country: search.country || 'BR',
      status: search.status || 'active',
      ad_status: search.adStatus || 'ACTIVE',
      results_count: search.resultsCount || 0,
      identified_offers_count: search.identifiedOffersCount || 0,
      last_executed_at: search.lastExecutedAt || null,
      next_execution_at: search.nextExecutionAt || null,
      frequency: search.frequency || 'daily',
      limit_results: search.limitResults || 100,
      created_at: search.createdAt || new Date().toISOString()
    };

    const { error } = await supabaseAdmin.from('monitored_searches').insert(dbPayload);
    if (error) {
      console.error(`Falha ao migrar pesquisa ${search.name}: ${error.message}`);
    } else {
      console.log(`✅ Pesquisa "${search.name}" migrada com sucesso.`);
    }
  }

  // MIGRAR OFERTAS
  console.log('\nMigrando Ofertas...');
  for (const offer of catalog) {
    const offerPayload = {
      user_id: targetUserId,
      slug: offer.slug,
      name: offer.name,
      summary: offer.summary,
      niche: offer.niche,
      country: offer.country,
      language: offer.language,
      status: offer.status,
      funnel_type: offer.funnelType,
      has_vsl: offer.hasVsl,
      ticket: offer.ticket,
      currency: offer.currency,
      active_ads_count: offer.activeAdsCount,
      unique_creatives_count: offer.uniqueCreativesCount,
      oldest_active_ad_days: offer.oldestActiveAdDays,
      ads_change_last_7_days: offer.adsChangeLast7Days,
      scale_score: offer.scaleScore,
      sales_page_url: offer.salesPageUrl,
      sales_page_domain: offer.salesPageDomain,
      page_technology: offer.pageTechnology,
      keywords: offer.keywords,
      platforms: offer.platforms,
      creative_formats: offer.creativeFormats,
      key_promises: offer.keyPromises,
      scale_evidences: offer.scaleEvidences,
      meta_library_search_url: offer.metaLibrarySearchUrl,
      first_seen_at: offer.firstSeenAt,
      last_checked_at: offer.lastCheckedAt || new Date().toISOString(),
      created_at: offer.firstSeenAt || new Date().toISOString()
    };

    const { data: insertedOffer, error: offerError } = await supabaseAdmin
      .from('offers')
      .upsert(offerPayload, { onConflict: 'user_id,slug' })
      .select('id')
      .single();

    if (offerError || !insertedOffer) {
      console.error(`Falha ao migrar oferta ${offer.slug}: ${offerError?.message}`);
      continue;
    }

    const offerId = insertedOffer.id;

    // Migrar Advertisers
    for (const adv of offer.advertiserPages || []) {
      await supabaseAdmin.from('offer_advertisers').upsert({
        user_id: targetUserId,
        offer_id: offerId,
        external_page_id: adv.id,
        name: adv.name,
        avatar_url: adv.avatarUrl,
        verified: adv.verified,
        category: adv.category,
        ads_count: adv.adsCount
      }, { onConflict: 'offer_id,external_page_id' });
    }

    // Migrar Creatives
    for (const cr of offer.creatives || []) {
      await supabaseAdmin.from('offer_creatives').upsert({
        user_id: targetUserId,
        offer_id: offerId,
        external_creative_id: cr.id,
        type: cr.type,
        thumbnail_url: cr.thumbnailUrl,
        media_url: cr.mediaUrl,
        title: cr.title,
        body: cr.body,
        ads_using_count: cr.adsUsingCount,
        first_seen_at: cr.firstSeenAt,
        duration: cr.duration,
        aspect_ratio: cr.aspectRatio,
        carousel_cards_count: cr.carouselCardsCount
      }, { onConflict: 'offer_id,external_creative_id' });
    }

    // Migrar Ads
    for (const ad of offer.ads || []) {
      await supabaseAdmin.from('offer_ads').upsert({
        user_id: targetUserId,
        offer_id: offerId,
        external_ad_id: ad.id,
        library_id: ad.libraryId,
        library_url: ad.libraryUrl,
        advertiser_page_id: ad.advertiserPageId,
        advertiser_page_name: ad.advertiserPageName,
        body: ad.body,
        title: ad.title,
        call_to_action: ad.callToAction,
        start_date: ad.startDate,
        is_active: ad.isActive,
        platforms: ad.platforms,
        creative_external_id: ad.creativeId,
        destination_url: ad.destinationUrl
      }, { onConflict: 'offer_id,external_ad_id' });
    }

    // Migrar Histórico
    for (const h of offer.history || []) {
      await supabaseAdmin.from('offer_history').upsert({
        user_id: targetUserId,
        offer_id: offerId,
        observed_at: h.date,
        active_ads: h.activeAds,
        unique_creatives: h.uniqueCreatives,
        ticket: h.ticket,
        scale_score: h.scaleScore
      }, { onConflict: 'offer_id,observed_at' });
    }

    console.log(`✅ Oferta "${offer.name}" migrada com sucesso.`);
  }

  console.log('\n[SUCESSO] Migração concluída com sucesso!');
}

runMigration().catch(console.error);
