import { supabaseAdmin } from '../supabase.js';
import type { Offer } from '../../src/types/offer.js';

export class OffersRepository {
  /**
   * Buscar todas as ofertas registradas do usuÃ¡rio no banco Supabase
   */
  static async getUserOffers(userId: string): Promise<Offer[]> {
    const { data: offersData, error: offersError } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('user_id', userId)
      .order('scale_score', { ascending: false });

    if (offersError) {
      console.error('[OffersRepository] Erro ao buscar ofertas:', offersError);
      throw new Error(`Falha ao buscar ofertas do banco: ${offersError.message}`);
    }

    if (!offersData || offersData.length === 0) {
      return [];
    }

    const offerIds = offersData.map((o) => o.id);

    // Buscar anunciantes, criativos, anÃºncios e histÃ³rico em lote
    const [advRes, creatRes, adsRes, histRes] = await Promise.all([
      supabaseAdmin.from('offer_advertisers').select('*').in('offer_id', offerIds),
      supabaseAdmin.from('offer_creatives').select('*').in('offer_id', offerIds),
      supabaseAdmin.from('offer_ads').select('*').in('offer_id', offerIds),
      supabaseAdmin.from('offer_history').select('*').in('offer_id', offerIds).order('observed_at', { ascending: true }),
    ]);

    const advertisersByOffer = this.groupByOfferId(advRes.data || []);
    const creativesByOffer = this.groupByOfferId(creatRes.data || []);
    const adsByOffer = this.groupByOfferId(adsRes.data || []);
    const historyByOffer = this.groupByOfferId(histRes.data || []);

    return offersData.map((row) =>
      this.mapToDomain(
        row,
        advertisersByOffer[row.id] || [],
        creativesByOffer[row.id] || [],
        adsByOffer[row.id] || [],
        historyByOffer[row.id] || []
      )
    );
  }

  /**
   * Buscar uma oferta especÃ­fica por ID ou Slug
   */
  static async getByIdOrSlug(idOrSlug: string, userId: string): Promise<Offer | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let query = supabaseAdmin.from('offers').select('*').eq('user_id', userId);

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const { data: row, error } = await query.single();

    if (error || !row) {
      return null;
    }

    const [advRes, creatRes, adsRes, histRes] = await Promise.all([
      supabaseAdmin.from('offer_advertisers').select('*').eq('offer_id', row.id),
      supabaseAdmin.from('offer_creatives').select('*').eq('offer_id', row.id),
      supabaseAdmin.from('offer_ads').select('*').eq('offer_id', row.id),
      supabaseAdmin.from('offer_history').select('*').eq('offer_id', row.id).order('observed_at', { ascending: true }),
    ]);

    return this.mapToDomain(
      row,
      advRes.data || [],
      creatRes.data || [],
      adsRes.data || [],
      histRes.data || []
    );
  }

  /**
   * Salvar/Mesclar lote de ofertas extraÃ­das da mineraÃ§Ã£o
   */
  static async saveBatch(userId: string, freshOffers: Offer[]): Promise<void> {
    for (const offer of freshOffers) {
      // Check if offer exists by slug
      const { data: existing } = await supabaseAdmin
        .from('offers')
        .select('id, active_ads_count, first_seen_at')
        .eq('user_id', userId)
        .eq('slug', offer.slug)
        .single();

      let offerId = existing?.id;
      const firstSeenAt = existing?.first_seen_at || offer.firstSeenAt || new Date().toISOString();
      const adsChange = existing ? offer.activeAdsCount - existing.active_ads_count : 0;

      const offerPayload = {
        user_id: userId,
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
        ads_change_last_7_days: adsChange,
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
        first_seen_at: firstSeenAt,
        last_checked_at: new Date().toISOString(),
      };

      if (existing) {
        await supabaseAdmin.from('offers').update(offerPayload).eq('id', offerId);
      } else {
        const { data: inserted, error } = await supabaseAdmin
          .from('offers')
          .insert(offerPayload)
          .select('id')
          .single();

        if (error) {
          console.error('[OffersRepository] Erro ao inserir oferta:', error);
          continue;
        }
        offerId = inserted.id;
      }

      if (!offerId) continue;

      // Upsert Advertisers
      for (const adv of offer.advertiserPages) {
        await supabaseAdmin.from('offer_advertisers').upsert(
          {
            user_id: userId,
            offer_id: offerId,
            external_page_id: adv.id,
            name: adv.name,
            avatar_url: adv.avatarUrl,
            verified: adv.verified,
            category: adv.category,
            ads_count: adv.adsCount,
          },
          { onConflict: 'offer_id,external_page_id' }
        );
      }

      // Upsert Creatives
      for (const cr of offer.creatives) {
        await supabaseAdmin.from('offer_creatives').upsert(
          {
            user_id: userId,
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
            carousel_cards_count: cr.carouselCardsCount,
          },
          { onConflict: 'offer_id,external_creative_id' }
        );
      }

      // Upsert Ads
      for (const ad of offer.ads) {
        await supabaseAdmin.from('offer_ads').upsert(
          {
            user_id: userId,
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
            destination_url: ad.destinationUrl,
          },
          { onConflict: 'offer_id,external_ad_id' }
        );
      }

      // Insert History Point
      if (offer.history && offer.history.length > 0) {
        const latestPoint = offer.history[offer.history.length - 1];
        await supabaseAdmin.from('offer_history').upsert(
          {
            user_id: userId,
            offer_id: offerId,
            observed_at: latestPoint.date || new Date().toISOString(),
            active_ads: latestPoint.activeAds,
            unique_creatives: latestPoint.uniqueCreatives,
            ticket: latestPoint.ticket,
            scale_score: latestPoint.scaleScore,
          },
          { onConflict: 'offer_id,observed_at' }
        );
      }
    }
  }

  private static groupByOfferId(list: any[]): Record<string, any[]> {
    const map: Record<string, any[]> = {};
    for (const item of list) {
      if (!map[item.offer_id]) map[item.offer_id] = [];
      map[item.offer_id].push(item);
    }
    return map;
  }

  private static mapToDomain(
    row: any,
    advertisers: any[],
    creatives: any[],
    ads: any[],
    history: any[]
  ): Offer {
    const domainOffer: any = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      summary: row.summary || '',
      niche: row.niche || '',
      country: row.country || 'BR',
      language: row.language || 'PT',
      status: row.status || 'monitored',
      funnelType: row.funnel_type || 'sales_page',
      hasVsl: Boolean(row.has_vsl),
      ticket: row.ticket !== null ? Number(row.ticket) : null,
      currency: row.currency || 'BRL',
      activeAdsCount: row.active_ads_count || 0,
      uniqueCreativesCount: row.unique_creatives_count || 0,
      oldestActiveAdDays: row.oldest_active_ad_days || 0,
      adsChangeLast7Days: row.ads_change_last_7_days || 0,
      scaleScore: row.scale_score || 0,
      salesPageUrl: row.sales_page_url || '',
      salesPageDomain: row.sales_page_domain || '',
      pageTechnology: row.page_technology || 'Desconhecida',
      keywords: Array.isArray(row.keywords) ? row.keywords : [],
      platforms: Array.isArray(row.platforms) ? row.platforms : [],
      creativeFormats: Array.isArray(row.creative_formats) ? row.creative_formats : [],
      keyPromises: Array.isArray(row.key_promises) ? row.key_promises : [],
      scaleEvidences: Array.isArray(row.scale_evidences) ? row.scale_evidences : [],
      metaLibrarySearchUrl: row.meta_library_search_url || '',
      firstSeenAt: row.first_seen_at ? new Date(row.first_seen_at).toISOString() : '',
      lastCheckedAt: row.last_checked_at ? new Date(row.last_checked_at).toISOString() : '',
      advertiserPages: advertisers.map((a) => ({
        id: a.external_page_id || a.id,
        name: a.name || '',
        avatarUrl: a.avatar_url || '',
        verified: Boolean(a.verified),
        category: a.category || '',
        adsCount: a.ads_count || 0,
      })),
      creatives: creatives.map((c) => ({
        id: c.external_creative_id || c.id,
        type: c.type || 'image',
        thumbnailUrl: c.thumbnail_url || '',
        mediaUrl: c.media_url,
        title: c.title,
        body: c.body || '',
        adsUsingCount: c.ads_using_count || 1,
        firstSeenAt: c.first_seen_at ? new Date(c.first_seen_at).toISOString() : '',
        duration: c.duration,
        aspectRatio: c.aspect_ratio,
        carouselCardsCount: c.carousel_cards_count,
      })),
      ads: ads.map((ad) => ({
        id: ad.external_ad_id || ad.id,
        libraryId: ad.library_id || '',
        libraryUrl: ad.library_url || '',
        advertiserPageId: ad.advertiser_page_id || '',
        advertiserPageName: ad.advertiser_page_name || '',
        body: ad.body || '',
        title: ad.title,
        callToAction: ad.call_to_action || '',
        startDate: ad.start_date ? new Date(ad.start_date).toISOString() : '',
        isActive: Boolean(ad.is_active),
        platforms: Array.isArray(ad.platforms) ? ad.platforms : [],
        creativeId: ad.creative_external_id || '',
        destinationUrl: ad.destination_url || '',
      })),
      history: history.map((h) => ({
        date: h.observed_at ? new Date(h.observed_at).toISOString() : '',
        activeAds: h.active_ads || 0,
        uniqueCreatives: h.unique_creatives || 0,
        ticket: h.ticket !== null ? Number(h.ticket) : null,
        scaleScore: h.scale_score || 0,
      })),
    };

    // Adiciona o mainCreative pegando o criativo com mais anÃºncios (ou o primeiro), fallback para imagem vazia se nÃ£o houver
    const mappedCreatives = domainOffer.creatives;
    const sortedCreatives = [...mappedCreatives].sort((a, b) => b.adsUsingCount - a.adsUsingCount);
    domainOffer.mainCreative = sortedCreatives.length > 0 
      ? sortedCreatives[0] 
      : {
          id: 'default',
          type: 'image',
          thumbnailUrl: 'https://placehold.co/600x400/131926/475569?text=Sem+Imagem',
          adsUsingCount: 0,
          firstSeenAt: new Date().toISOString()
        };

    return domainOffer;
  }
}

