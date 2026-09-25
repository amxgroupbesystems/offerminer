import assert from 'node:assert/strict';
import test from 'node:test';
import { isStoredOfferEligible, transformAdsToOffers } from './transformAds.ts';
import { validateLowTicketLandingPage } from './landingPageClassifier.ts';

const now=new Date('2026-09-24T12:00:00.000Z');
function rawAd(id:string,overrides:Record<string,unknown>={}){
  return {
    ad_archive_id:id,page_id:'page-1',page_name:'Clube da Pedagogia',is_active:true,
    start_date:'2026-09-20T12:00:00.000Z',publisher_platform:['FACEBOOK','INSTAGRAM'],
    snapshot:{
      body:{text:'Kit de atividades pedagÃ³gicas em PDF por apenas R$ 10. Acesso imediato e garantia.'},
      title:'Kit de atividades',cta_text:'Comprar agora',link_url:'https://oferta.exemplo.com/kit/?utm_source=fb',
      images:[{original_image_url:`https://cdn-${id}.example.net/assets/mesmo-criativo.jpg`}],
    },...overrides,
  };
}

test('mantÃ©m somente anÃºncios ativos, recentes e com destino comercial externo',()=>{
  const inactive=rawAd('inactive',{is_active:false});
  const old=rawAd('old',{start_date:'2026-07-01T12:00:00.000Z'});
  const social=rawAd('social',{snapshot:{...rawAd('x').snapshot,link_url:'https://instagram.com/perfil'}});
  const offers=transformAdsToOffers([rawAd('ok'),inactive,old,social],'EducaÃ§Ã£o',['kit atividades'],now);
  assert.equal(offers.length,1);
  assert.equal(offers[0].activeAdsCount,1);
  assert.equal(offers[0].oldestActiveAdDays,4);
  assert.equal(offers[0].ads.every((ad)=>ad.isActive),true);
});

test('rejeita rifa fÃ­sica mesmo quando o texto contÃ©m preÃ§o e kit',()=>{
  const raffle=rawAd('raffle',{snapshot:{...rawAd('x').snapshot,body:{text:'Rifa da caminhonete com kit por apenas R$ 0,10. Concorra agora.'}}});
  assert.equal(transformAdsToOffers([raffle],'EducaÃ§Ã£o',['kit'],now).length,0);
});

test('oculta oferta antiga ou indesejada jÃ¡ armazenada',()=>{
  const valid=transformAdsToOffers([rawAd('stored')],'EducaÃ§Ã£o',['kit atividades'],now)[0];
  assert.equal(isStoredOfferEligible(valid),true);
  assert.equal(isStoredOfferEligible({...valid,oldestActiveAdDays:31}),false);
  assert.equal(isStoredOfferEligible({...valid,summary:'Rifa da caminhonete: concorra por centavinhos'}),false);
});

test('deduplica a mesma mÃ­dia e copy e contabiliza anÃºncios que usam o criativo',()=>{
  const first=rawAd('one');
  const second=rawAd('two');
  const offers=transformAdsToOffers([first,second],'EducaÃ§Ã£o',['kit atividades'],now);
  assert.equal(offers[0].uniqueCreativesCount,1);
  assert.equal(offers[0].creatives[0].adsUsingCount,2);
  assert.match(offers[0].metaLibrarySearchUrl||'',/view_all_page_id=page-1/);
});

test('valida estrutura de pÃ¡gina low ticket e rejeita catÃ¡logo genÃ©rico',async()=>{
  const offer=transformAdsToOffers([rawAd('landing')],'EducaÃ§Ã£o',['kit atividades'],now)[0];
  const originalFetch=globalThis.fetch;
  try{
    globalThis.fetch=async()=>new Response('<html><body><h1>Kit de atividades em PDF</h1><p>O que vocÃª vai receber</p><p>BÃ´nus exclusivo</p><p>Garantia de 7 dias</p><strong>R$ 10,00</strong><a href="/checkout">Quero receber</a></body></html>',{status:200,headers:{'content-type':'text/html'}});
    assert.equal((await validateLowTicketLandingPage(offer)).accepted,true);
    globalThis.fetch=async()=>new Response('<html><body>CatÃ¡logo de produtos Filtrar produtos Ordene por Frete grÃ¡tis Estoque Meus pedidos</body></html>',{status:200,headers:{'content-type':'text/html'}});
    assert.equal((await validateLowTicketLandingPage(offer)).accepted,false);
  }finally{globalThis.fetch=originalFetch;}
});

