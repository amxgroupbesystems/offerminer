import crypto from 'node:crypto';
import type { Ad, Creative, CreativeFormat, FunnelType, Offer, Platform } from '../src/types/offer';
import { getNicheSeeds, PRODUCT_FORMATS } from './nicheQueries';

type Raw = Record<string, any>;
const P: Record<string, Platform> = { FACEBOOK:'facebook', INSTAGRAM:'instagram', MESSENGER:'messenger', AUDIENCE_NETWORK:'audience_network', THREADS:'threads' };
const hash = (v:string) => crypto.createHash('sha1').update(v).digest('hex').slice(0,16);
const slug = (v:string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,70);
const pick=(value:Raw,...keys:string[])=>keys.map(key=>value?.[key]).find(item=>item!==undefined&&item!==null);
const asArray=<T>(value:T|T[]|undefined|null):T[]=>value==null?[]:Array.isArray(value)?value:[value];
const isoDate=(value:unknown,formatted?:unknown):string=>{
  if(typeof formatted==='string'&&formatted)return formatted;
  if(typeof value==='number')return new Date(value*(value<1e12?1000:1)).toISOString();
  if(typeof value==='string'&&value)return /^\d+$/.test(value)?new Date(Number(value)*(Number(value)<1e12?1000:1)).toISOString():new Date(value).toISOString();
  return new Date().toISOString();
};

function cleanUrl(raw?:string):string {
  if (!raw) return '';
  try {
    const u=new URL(raw);
    [...u.searchParams.keys()].forEach(k=>/^(utm_|fbclid|gclid|src|ref)/i.test(k)&&u.searchParams.delete(k));
    u.hash=''; u.pathname=u.pathname.replace(/\/$/,'')||'/'; return u.toString();
  } catch { return raw; }
}
const BLOCKED_DESTINATION=/((^|\.)facebook\.com|(^|\.)instagram\.com|(^|\.)messenger\.com|(^|\.)threads\.net|(^|\.)tiktok\.com|(^|\.)youtube\.com|(^|\.)youtu\.be|(^|\.)amazon\.|(^|\.)mercadolivre\.com|(^|\.)shopee\.|(^|\.)aliexpress\.)/i;
function validDestination(raw:string):boolean {
  try { const url=new URL(raw); return /^https?:$/.test(url.protocol)&&!BLOCKED_DESTINATION.test(url.hostname); }
  catch { return false; }
}
function groupKey(url:string,pageId:string):string {
  try { const u=new URL(url); return u.hostname.endsWith('.lovable.app')?u.hostname.toLowerCase():`${u.hostname.toLowerCase()}${u.pathname}`.replace(/\/$/,''); }
  catch { return `${pageId}:${url}`; }
}
function funnel(url:string,text:string):FunnelType {
  const v=`${url} ${text}`.toLowerCase();
  if(/wa\.me|whatsapp/.test(v))return'whatsapp'; if(/quiz|question[aá]rio/.test(v))return'quiz';
  if(/checkout|pay\.|cakto|hotmart|kiwify|monetizze/.test(v))return'direct_checkout';
  if(/play\.google|itunes\.apple/.test(v))return'app'; return'sales_page';
}
function technology(url:string):string {
  try { const h=new URL(url).hostname; if(h.endsWith('.lovable.app'))return'Lovable'; if(/shopify/.test(h))return'Shopify'; if(/hotmart|kiwify|cakto|monetizze/.test(h))return'Checkout'; } catch {}
  return'Domínio próprio';
}
function price(text:string):number|null {
  const n=[...text.matchAll(/(?:r\$\s*|por\s+apenas\s+(?:r\$\s*)?)(\d{1,3}(?:[.,]\d{1,2})?)\b(?!\s*x)/gi)].map(m=>+m[1].replace(',','.')).filter(v=>v>0&&v<=500);
  return n.length?Math.min(...n):null;
}
function format(v='IMAGE'):CreativeFormat { v=v.toUpperCase(); return v==='VIDEO'?'video':v==='CAROUSEL'?'carousel':/DPA|DCO/.test(v)?'dynamic':'image'; }
function media(item:Raw):{url:string;thumb:string;type:CreativeFormat}[] {
  const s=item.snapshot??{}, out:{url:string;thumb:string;type:CreativeFormat}[]=[];
  const add=(url?:string,thumb?:string,type:CreativeFormat='image')=>url&&out.push({url,thumb:thumb||url,type});
  for(const x of asArray<Raw>(s.images))add(pick(x,'original_image_url','originalImageUrl','resized_image_url','resizedImageUrl'),pick(x,'resized_image_url','resizedImageUrl','original_image_url','originalImageUrl'),'image');
  for(const x of asArray<Raw>(s.videos))add(pick(x,'video_hd_url','videoHdUrl','video_sd_url','videoSdUrl'),pick(x,'video_preview_image_url','videoPreviewImageUrl'),'video');
  for(const x of asArray<Raw>(s.cards)){add(pick(x,'video_hd_url','videoHdUrl','video_sd_url','videoSdUrl'),pick(x,'video_preview_image_url','videoPreviewImageUrl'),'video');add(pick(x,'original_image_url','originalImageUrl','resized_image_url','resizedImageUrl'),pick(x,'resized_image_url','resizedImageUrl'),'image');}
  return out.length?out:[{url:'',thumb:'',type:format(pick(s,'display_format','displayFormat'))}];
}

function adText(item:Raw):string {
  const s=item.snapshot??{};
  return [pick(s.body??{},'text'),pick(s,'title'),pick(s,'link_description','linkDescription'),...asArray<Raw>(s.cards).flatMap(card=>[pick(card,'body'),pick(card,'title')])].filter(Boolean).join(' ');
}

export function isLowTicketCandidate(item:Raw):boolean {
  const text=adText(item).toLocaleLowerCase('pt-BR');
  const explicitlyInactive=pick(item,'is_active','isActive')===false||/inactive/i.test(String(pick(item,'active_status','activeStatus')||''));
  if(explicitlyInactive)return false;
  const installment=/\b\d{1,2}\s*x\s*(?:de\s*)?(?:r\$\s*)?\d/i.test(text);
  const ticket=price(text);
  const digital=PRODUCT_FORMATS.some(format=>text.includes(format.toLocaleLowerCase('pt-BR')))||/\b(moldes?|material digital|acesso imediato|download|atividades?|templates?|arquivos?)\b/i.test(text);
  const offer=/\b(por apenas|oferta|promo[cç][aã]o|b[oô]nus|garantia|compre agora|quero receber|acesso vital[ií]cio|entrega imediata)\b/i.test(text);
  const unwanted=/\b(rifa|sorteio|concorra|centavinhos?|bilhete|n[uú]mero da sorte|ganhe (?:um|uma)|carro|caminhonete|motocicleta|ve[ií]culo|frete|estoque|tamanho p|tamanho m|tamanho g)\b/i.test(text);
  return !unwanted&&!installment&&digital&&((ticket!==null&&ticket<=100)||offer);
}

export function isStoredOfferEligible(offer:Offer):boolean {
  const maxAgeDays=Math.max(0,Number(process.env.MAX_AD_AGE_DAYS||30));
  if(offer.activeAdsCount<1||offer.oldestActiveAdDays>maxAgeDays||!validDestination(offer.salesPageUrl))return false;
  const text=`${offer.name} ${offer.summary} ${offer.ads.map(ad=>`${ad.body} ${ad.title||''}`).join(' ')}`.toLocaleLowerCase('pt-BR');
  const digital=PRODUCT_FORMATS.some(format=>text.includes(format.toLocaleLowerCase('pt-BR')))||/\b(moldes?|material digital|acesso imediato|download|atividades?|templates?|arquivos?)\b/i.test(text);
  const offerSignal=offer.ticket!==null&&offer.ticket>0&&offer.ticket<=100||/\b(por apenas|oferta|promo[cç][aã]o|b[oô]nus|garantia|compre agora|quero receber|acesso vital[ií]cio|entrega imediata)\b/i.test(text);
  const unwanted=/\b(rifa|sorteio|concorra|centavinhos?|bilhete|n[uú]mero da sorte|ganhe (?:um|uma)|carro|caminhonete|motocicleta|ve[ií]culo|frete|estoque)\b/i.test(text);
  return digital&&offerSignal&&!unwanted&&offer.ads.every(ad=>ad.isActive);
}

const NICHE_SIGNALS:Record<string,RegExp>={
  educação:/\b(educa|professor|alfabet|pedag|escolar|aluno|aula|curso|enem|atividade)\w*/i,
  saúde:/\b(sa[uú]de|bem.?estar|alimenta|exerc[ií]cio|terap|nutri|cl[ií]nica)\w*/i,
  espiritualidade:/\b(espiritual|b[ií]blia|devocional|ora[cç][aã]o|f[eé]|teologia)\w*/i,
  artesanato:/\b(artesan|molde|papelaria|croch[eê]|costura|feito.?[aà].?m[aã]o)\w*/i,
  culinária:/\b(culin[aá]ria|receita|confeitaria|doce|bolo|cozinha|gastronom)\w*/i,
  profissionalizante:/\b(profissional|t[eé]cnico|curso|manual|apostila|certificado|capacita)\w*/i,
  emagrecimento:/\b(emagrec|dieta|fitness|peso|gordura|plano.?alimentar)\w*/i,
  'renda extra':/\b(renda|neg[oó]cio|vendas?|marketing|fatur|empreend)\w*/i,
};

function isNicheRelevant(item:Raw,niche:string):boolean {
  const normalized=niche.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const known=Object.entries(NICHE_SIGNALS).find(([key])=>key.normalize('NFD').replace(/[\u0300-\u036f]/g,'')===normalized)?.[1];
  if(known)return known.test(adText(item));
  const terms=getNicheSeeds(niche)
    .flatMap(seed=>seed.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().split(/\s+/))
    .filter(term=>term.length>=4);
  if(!terms.length)return true;
  const normalizedText=adText(item).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  return terms.some(term=>normalizedText.includes(term));
}

function requiredDomain(filterKeyword=''):string|undefined {
  return filterKeyword.match(/\+\s*((?:[a-z0-9-]+\.)+[a-z]{2,})/i)?.[1]?.toLowerCase();
}

export function transformAdsToOffers(raw:Raw[],niche:string,keywords:string[],now=new Date(),filterKeyword=''):Offer[] {
  const groups=new Map<string,{destination:string;items:Raw[]}>();
  const domainFilter=requiredDomain(filterKeyword);
  const maxAgeDays=Math.max(0,Number(process.env.MAX_AD_AGE_DAYS||30));
  for(const item of raw.filter(item=>isLowTicketCandidate(item)&&isNicheRelevant(item,niche))){
    const startDate=isoDate(pick(item,'start_date','startDate'),pick(item,'start_date_formatted','startDateFormatted'));
    const ageDays=Math.max(0,Math.floor((now.getTime()-new Date(startDate).getTime())/86400000));
    if(!Number.isFinite(ageDays)||ageDays>maxAgeDays)continue;
    const s=item.snapshot??{};
    const urls=[pick(s,'link_url','linkUrl'),...asArray<Raw>(s.cards).map((c:Raw)=>pick(c,'link_url','linkUrl'))].map(cleanUrl).filter(Boolean);
    const destination=urls.find((u:string)=>validDestination(u));
    if(!destination)continue;
    if(domainFilter){try{if(!new URL(destination).hostname.toLowerCase().endsWith(domainFilter))continue;}catch{continue;}}
    const pageId=String(pick(item,'page_id','pageId','pageID')||'');
    const key=groupKey(destination,pageId);
    const g=groups.get(key)??{destination,items:[]};
    const archiveId=String(pick(item,'ad_archive_id','adArchiveID','adArchiveId')||'');
    if(!g.items.some(x=>String(pick(x,'ad_archive_id','adArchiveID','adArchiveId'))===archiveId))g.items.push(item);
    groups.set(key,g);
  }
  return [...groups.entries()].map(([key,g]):Offer=>{
    const creatives=new Map<string,Creative>(), advertisers=new Map<string,Offer['advertiserPages'][number]>(), ads:Ad[]=[]; let text='';
    for(const item of g.items){
      const s=item.snapshot??{}, cards=asArray<Raw>(s.cards), body=pick(s.body??{},'text')||pick(cards[0]??{},'body')||'', rawTitle=pick(s,'title'), title=rawTitle&&!String(rawTitle).includes('{{')?rawTitle:pick(cards[0]??{},'title')||null;
      text+=` ${body} ${title||''} ${pick(s,'link_description','linkDescription')||''}`;
      const libraryId=String(pick(item,'ad_archive_id','adArchiveID','adArchiveId')||''), display=pick(s,'display_format','displayFormat');
      const m=media(item)[0];
      const normalizedCopy=`${body} ${title||''}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
      let assetSignature='';
      try { const source=new URL(m.url||m.thumb); assetSignature=source.pathname.split('/').pop()||source.pathname; } catch { assetSignature=m.url||m.thumb; }
      const officialCollationId=String(pick(item,'collation_id','collationId')||'');
      const ckey=officialCollationId||`${m.type}|${assetSignature}|${normalizedCopy}`||`${libraryId}:${display}`;
      const cid=`creative-${hash(ckey)}`, old=creatives.get(cid);
      const startDate=isoDate(pick(item,'start_date','startDate'),pick(item,'start_date_formatted','startDateFormatted'));
      const officialCount=Number(pick(item,'collation_count','collationCount','ads_using_count','adsUsingCount'))||0;
      if(old){old.adsUsingCount=Math.max(old.adsUsingCount+1,officialCount);if(new Date(startDate)<new Date(old.firstSeenAt))old.firstSeenAt=startDate;}
      else creatives.set(cid,{id:cid,type:m.type,thumbnailUrl:m.thumb,mediaUrl:m.url||undefined,title:title||undefined,body,adsUsingCount:Math.max(1,officialCount),firstSeenAt:startDate});
      const pageId=String(pick(item,'page_id','pageId','pageID')||'unknown'), pageName=pick(item,'page_name','pageName')||pick(s,'page_name','pageName')||'Página não identificada', previous=advertisers.get(pageId);
      advertisers.set(pageId,{id:pageId,name:pageName,avatarUrl:pick(s,'page_profile_picture_url','pageProfilePictureUrl'),category:asArray<string>(pick(s,'page_categories','pageCategories'))[0],adsCount:(previous?.adsCount||0)+1});
      const platforms=asArray<string>(pick(item,'publisher_platform','publisherPlatform')).map((x:string)=>P[x]).filter(Boolean);
      ads.push({id:`ad-${libraryId}`,libraryId,libraryUrl:`https://www.facebook.com/ads/library/?id=${libraryId}`,advertiserPageId:pageId,advertiserPageName:pageName,body,title,callToAction:pick(s,'cta_text','ctaText')||pick(cards[0]??{},'cta_text','ctaText')||null,startDate,isActive:true,platforms,creativeId:cid,destinationUrl:g.destination});
    }
    const active=ads.filter(a=>a.isActive), dates=active.map(a=>new Date(a.startDate).getTime()).filter(Number.isFinite), oldest=dates.length?new Date(Math.min(...dates)):now;
    const age=Math.max(0,Math.floor((now.getTime()-oldest.getTime())/86400000)), cs=[...creatives.values()], count=active.length, score=Math.min(100,Math.round(age*.25+count*4+cs.length*5));
    const status=age<14?'recent':age>=30&&count>=3&&cs.length>=2?'scaling':'monitored';
    let domain=g.destination;try{domain=new URL(g.destination).hostname}catch{}
    const generic=/^(saiba mais|learn more|shop now|comprar agora|ver detalhes|clique aqui)$/i;
    const name=g.items.flatMap(x=>[pick(asArray<Raw>(x.snapshot?.cards)[0]??{},'title'),pick(x.snapshot??{},'title')])
      .find(x=>x&&!String(x).includes('{{')&&!generic.test(String(x).trim()))
      ||advertisers.values().next().value?.name||domain;
    const id=`offer-${hash(key)}`, platforms=[...new Set(ads.flatMap(a=>a.platforms))], formats=[...new Set(cs.map(c=>c.type))];
    const mainCreative=[...cs].sort((a,b)=>b.adsUsingCount-a.adsUsingCount)[0];
    const advertiserPageId=ads[0]?.advertiserPageId;
    const advertiserLibraryUrl=advertiserPageId?`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&view_all_page_id=${encodeURIComponent(advertiserPageId)}`:ads[0]?.libraryUrl;
    return {id,slug:`${slug(String(name))}-${hash(key).slice(0,6)}`,name:String(name),summary:active[0]?.body?.slice(0,220)||'Oferta identificada na Meta Ads Library.',niche,country:'Brasil',language:'Português',status,funnelType:funnel(g.destination,text),creativeFormats:formats,hasVsl:/vsl|video sales letter|assista ao vídeo/i.test(text),ticket:price(text),currency:'BRL',activeAdsCount:count,uniqueCreativesCount:cs.length,oldestActiveAdDays:age,adsChangeLast7Days:0,scaleScore:score,salesPageUrl:g.destination,salesPageDomain:domain,pageTechnology:technology(g.destination),advertiserPages:[...advertisers.values()],mainCreative,creatives:cs,ads:active,keywords,platforms,firstSeenAt:oldest.toISOString(),lastCheckedAt:now.toISOString(),timeline:[{id:`timeline-${id}`,date:oldest.toISOString(),type:'first_seen',title:'Primeiro anúncio observado',description:'Data inicial mais antiga informada pela Meta.'}],history:[{date:now.toISOString().slice(0,10),activeAds:count,uniqueCreatives:cs.length}],isFavorite:false,scaleEvidences:[`${count} anúncios ativos observados`,`${cs.length} criativos únicos`,`Anúncio mais antigo iniciado há ${age} dias`],metaLibrarySearchUrl:advertiserLibraryUrl};
  }).filter(o=>o.activeAdsCount>0).sort((a,b)=>b.scaleScore-a.scaleScore);
}
