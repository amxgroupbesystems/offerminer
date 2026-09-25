import type { Offer } from '../src/types/offer';

const BLOCKED_HOSTS = [
  /(^|\.)facebook\.com$/i, /(^|\.)instagram\.com$/i, /(^|\.)messenger\.com$/i,
  /(^|\.)threads\.net$/i, /(^|\.)tiktok\.com$/i, /(^|\.)youtube\.com$/i,
  /(^|\.)youtu\.be$/i, /(^|\.)amazon\./i, /(^|\.)mercadolivre\.com/i,
  /(^|\.)shopee\./i, /(^|\.)aliexpress\./i, /(^|\.)magazineluiza\.com/i,
];

const DIGITAL = /\b(e-?book|pdf|guia|manual|apostila|checklist|planilha|planner|kit|pack|combo|template|modelo|prompt|curso|treinamento|m[eé]todo|protocolo|material|atividade|aula|receita|b[oô]nus|acesso imediato|download)\b/i;
const CTA = /\b(comprar agora|quero (?:comprar|receber|garantir)|garanta (?:agora|o seu)|acesso imediato|comece agora|adquirir|eu quero|inscreva-se)\b/i;
const SECTIONS = [/[bôo]nus/i, /garantia(?: incondicional)?(?: de)? 7 dias/i, /depoimentos?|quem (?:já )?comprou/i, /perguntas frequentes|faq/i, /o que (?:voc[eê] )?(?:vai|ir[aá]) receber/i, /benef[ií]cios?|por que escolher/i];
const ECOMMERCE = /\b(adicionar ao carrinho|categorias de produtos|filtrar produtos|ordene por|frete gr[aá]tis|tamanhos?\s*:|sku\s*:|estoque|meus pedidos)\b/i;

function publicDestination(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (!/^https?:$/.test(url.protocol) || !url.hostname) return null;
    const host = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.some((pattern) => pattern.test(host))) return null;
    if (host === 'localhost' || host.endsWith('.local') || /^(?:127|10|0)\./.test(host)) return null;
    if (/^192\.168\./.test(host) || /^169\.254\./.test(host)) return null;
    const private172 = host.match(/^172\.(\d+)\./);
    if (private172 && Number(private172[1]) >= 16 && Number(private172[1]) <= 31) return null;
    return url;
  } catch { return null; }
}

function visibleText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|quot|#39);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 250_000);
}

function prices(text: string): number[] {
  return [...text.matchAll(/(?:r\$\s*|por\s+apenas\s+)(\d{1,3}(?:[.,]\d{1,2})?)/gi)]
    .map((match) => Number(match[1].replace(',', '.')))
    .filter((value) => value > 0 && value <= 100);
}

export type LandingValidation = { accepted: boolean; finalUrl: string; reason: string };

export async function validateLowTicketLandingPage(offer: Offer): Promise<LandingValidation> {
  let current = publicDestination(offer.salesPageUrl);
  if (!current) return { accepted: false, finalUrl: offer.salesPageUrl, reason: 'destino bloqueado ou inválido' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    let response: Response | undefined;
    for (let redirect = 0; redirect <= 4; redirect++) {
      response = await fetch(current, {
        redirect: 'manual', signal: controller.signal,
        headers: { 'user-agent': 'OfferMiner/1.0 (+landing-page-validation)', accept: 'text/html,application/xhtml+xml' },
      });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) break;
        const next = publicDestination(new URL(location, current).toString());
        if (!next) return { accepted: false, finalUrl: current.toString(), reason: 'redirecionamento bloqueado' };
        current = next;
        continue;
      }
      break;
    }
    if (!response?.ok) return { accepted: false, finalUrl: current.toString(), reason: `página respondeu HTTP ${response?.status ?? 0}` };
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return { accepted: false, finalUrl: current.toString(), reason: 'destino não é uma página HTML' };
    }
    const contentLength = Number(response.headers.get('content-length') || 0);
    if (contentLength > 2_000_000) return { accepted: false, finalUrl: current.toString(), reason: 'página excede o limite de análise' };
    const html = (await response.text()).slice(0, 2_000_000);
    const text = visibleText(html);
    const combined = `${text} ${offer.summary} ${offer.ads.map((ad) => `${ad.body} ${ad.title || ''} ${ad.callToAction || ''}`).join(' ')}`;

    const pagePrices = prices(text);
    const hasLowPrice = pagePrices.length > 0 || (offer.ticket !== null && offer.ticket > 0 && offer.ticket <= 100);
    const hasDigitalProduct = DIGITAL.test(combined);
    const hasCta = CTA.test(combined) || /href=["'][^"']*(?:checkout|pay|kiwify|hotmart|cakto|monetizze)/i.test(html);
    const sectionCount = SECTIONS.filter((pattern) => pattern.test(text)).length;
    const ecommerceSignals = (text.match(new RegExp(ECOMMERCE.source, 'gi')) || []).length;
    let score = 0;
    if (hasLowPrice) score += 3;
    if (hasDigitalProduct) score += 3;
    if (hasCta) score += 2;
    score += Math.min(sectionCount, 3);
    if (ecommerceSignals >= 3 && sectionCount < 2) score -= 5;

    const accepted = score >= 6 && hasDigitalProduct && (hasLowPrice || hasCta);
    return { accepted, finalUrl: current.toString(), reason: accepted ? `low ticket confirmado (${score} sinais)` : `sinais insuficientes (${score})` };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { accepted: false, finalUrl: current.toString(), reason: `não foi possível validar a página: ${message}` };
  } finally { clearTimeout(timer); }
}

export async function keepValidatedLowTicketOffers(offers: Offer[]): Promise<Offer[]> {
  const kept: Offer[] = [];
  const concurrency = 5;
  for (let index = 0; index < offers.length; index += concurrency) {
    const batch = offers.slice(index, index + concurrency);
    const results = await Promise.all(batch.map(async (offer) => ({ offer, validation: await validateLowTicketLandingPage(offer) })));
    for (const { offer, validation } of results) {
      if (!validation.accepted) {
        console.log(`[FILTRO LOW TICKET] Rejeitada url=${JSON.stringify(offer.salesPageUrl)} motivo=${validation.reason}`);
        continue;
      }
      offer.salesPageUrl = validation.finalUrl;
      try { offer.salesPageDomain = new URL(validation.finalUrl).hostname; } catch {}
      kept.push(offer);
    }
  }
  return kept;
}
