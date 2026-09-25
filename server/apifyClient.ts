import { randomInt } from 'node:crypto';

const API_BASE='https://api.apify.com/v2';
const TERMINAL_STATUSES=new Set(['SUCCEEDED','FAILED','ABORTED','TIMED-OUT']);

type ApifyRun={id:string;status:string;defaultDatasetId?:string;statusMessage?:string};
export type StartedApifyRun={runId:string;tokenSlot:number;mode:'fixed'|'random'};

export type ApifyIntegrationStatus={
  configured:boolean;
  tokenMasked:string|null;
  selectionMode:'fixed'|'random';
  activeTokenSlot:number|null;
  configuredTokenSlots:number[];
  actorId:string;
};

const delay=(ms:number)=>new Promise(resolve=>setTimeout(resolve,ms));

function errorDetail(error:unknown):string{
  if(!(error instanceof Error))return String(error);
  const cause=error.cause as (Error&{code?:string})|undefined;
  if(!cause)return error.message;
  const code=cause.code?` [${cause.code}]`:'';
  return `${error.message}: ${cause.message}${code}`;
}

function getActiveTokenSlot():number{
  const slot=Number(process.env.APIFY_ACTIVE_TOKEN||1);
  if(!Number.isInteger(slot)||slot<1||slot>15){
    throw new Error('APIFY_ACTIVE_TOKEN deve ser um nÃºmero inteiro entre 1 e 15.');
  }
  return slot;
}

function configuredTokenSlots():number[]{
  return Array.from({length:15},(_,index)=>index+1)
    .filter(slot=>Boolean(process.env[`APIFY_TOKEN_${slot}`]?.trim()||(slot===1&&process.env.APIFY_TOKEN?.trim())));
}

function getSelectionMode():'fixed'|'random'{
  const mode=(process.env.APIFY_TOKEN_SELECTION||'fixed').trim().toLowerCase();
  if(mode!=='fixed'&&mode!=='random')throw new Error('APIFY_TOKEN_SELECTION deve ser "fixed" ou "random".');
  return mode;
}

function selectToken():{slot:number;token:string;mode:'fixed'|'random'}{
  const mode=getSelectionMode();
  const slots=configuredTokenSlots();
  if(!slots.length)throw new Error('Nenhum token Apify foi configurado no arquivo .env.local.');
  const slot=mode==='random'?slots[randomInt(slots.length)]:getActiveTokenSlot();
  // APIFY_TOKEN mantÃ©m compatibilidade com instalaÃ§Ãµes anteriores na posiÃ§Ã£o 1.
  const token=(process.env[`APIFY_TOKEN_${slot}`]||(slot===1?process.env.APIFY_TOKEN:''))?.trim();
  if(!token)throw new Error(`APIFY_TOKEN_${slot} nÃ£o configurado no arquivo .env.local.`);
  return {slot,token,mode};
}

function getActorId():string{
  return (process.env.APIFY_ACTOR_ID||'jmlp/meta-ad-library-scraper').trim();
}

export function getApifyIntegrationStatus():ApifyIntegrationStatus{
  const selectionMode=getSelectionMode();
  const activeTokenSlot=selectionMode==='fixed'?getActiveTokenSlot():null;
  const token=activeTokenSlot?(process.env[`APIFY_TOKEN_${activeTokenSlot}`]||(activeTokenSlot===1?process.env.APIFY_TOKEN:''))?.trim():null;
  const slots=configuredTokenSlots();
  return {
    configured:selectionMode==='random'?slots.length>0:Boolean(token),
    tokenMasked:token?`â€¢â€¢â€¢â€¢${token.slice(-4)}`:null,
    selectionMode,
    activeTokenSlot,
    configuredTokenSlots:slots,
    actorId:getActorId(),
  };
}

async function apifyFetch(url:URL,token:string,init?:RequestInit,retries=2):Promise<Response>{
  let lastError:unknown;
  for(let attempt=0;attempt<=retries;attempt++){
    try{
      const headers=new Headers(init?.headers);
      headers.set('authorization',`Bearer ${token}`);
      const response=await fetch(url,{...init,headers});
      if(response.ok||response.status<500)return response;
      lastError=new Error(`Apify respondeu HTTP ${response.status}: ${(await response.text()).slice(0,300)}`);
    }catch(error){lastError=error;}
    if(attempt<retries)await delay(1000*2**attempt);
  }
  const detail=errorDetail(lastError);
  throw new Error(`NÃ£o foi possÃ­vel comunicar com a Apify apÃ³s novas tentativas: ${detail}`);
}

async function responseData<T>(response:Response,context:string):Promise<T>{
  if(!response.ok)throw new Error(`${context} (${response.status}): ${(await response.text()).slice(0,500)}`);
  const payload=await response.json() as {data?:T}|T;
  return ((payload as {data?:T}).data??payload) as T;
}

export async function startApifyCollection(input:{queries:string[];country:string;resultsPerQuery:number}):Promise<StartedApifyRun>{
  const selected=selectToken();
  console.log(`[APIFY] tokenSlot=${selected.slot} modo=${selected.mode}`);
  const actor=getActorId().replace('/','~');
  const keywords=[...new Set(input.queries.map(query=>query.trim()).filter(Boolean))];
  if(!keywords.length)throw new Error('Nenhuma palavra-chave vÃ¡lida foi informada para a coleta.');
  const maxAds=Math.max(1,Math.min(input.resultsPerQuery,1000));
  const startUrl=new URL(`${API_BASE}/acts/${actor}/runs`); startUrl.searchParams.set('waitForFinish','0');
  const startResponse=await apifyFetch(startUrl,selected.token,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({keywords,searchType:'keyword_unordered',country:input.country||'BR',activeStatus:'active',maxAds,maxConcurrency:1,raw:false,proxyConfiguration:{useApifyProxy:true,apifyProxyGroups:['RESIDENTIAL']}})});
  const run=await responseData<ApifyRun>(startResponse,'Falha ao iniciar o Actor da Apify');
  if(!run.id)throw new Error('A Apify nÃ£o informou o ID da execuÃ§Ã£o.');
  return {runId:run.id,tokenSlot:selected.slot,mode:selected.mode};
}

export async function getApifyRun(runId:string,tokenSlot:number):Promise<ApifyRun>{
  const token=(process.env[`APIFY_TOKEN_${tokenSlot}`]||(tokenSlot===1?process.env.APIFY_TOKEN:''))?.trim();
  if(!token)throw new Error(`Token da posiÃ§Ã£o ${tokenSlot} nÃ£o estÃ¡ configurado.`);
  const response=await apifyFetch(new URL(`${API_BASE}/actor-runs/${runId}`),token,undefined,3);
  return responseData<ApifyRun>(response,'Falha ao consultar a execuÃ§Ã£o da Apify');
}

export async function getApifyDataset(run:ApifyRun,tokenSlot:number):Promise<Record<string,any>[]> {
  const token=(process.env[`APIFY_TOKEN_${tokenSlot}`]||(tokenSlot===1?process.env.APIFY_TOKEN:''))?.trim();
  if(!token)throw new Error(`Token da posiÃ§Ã£o ${tokenSlot} nÃ£o estÃ¡ configurado.`);
  if(run.status!=='SUCCEEDED')throw new Error(`A coleta ${run.id} terminou com status ${run.status}.`);
  if(!run.defaultDatasetId)throw new Error(`A coleta ${run.id} terminou sem um Dataset associado.`);
  const url=new URL(`${API_BASE}/datasets/${run.defaultDatasetId}/items`); url.searchParams.set('clean','true'); url.searchParams.set('format','json');
  const items=await responseData<Record<string,any>[]>(await apifyFetch(url,token,undefined,3),'Falha ao baixar o Dataset da Apify');
  if(!Array.isArray(items))throw new Error('A Apify retornou um Dataset em formato inesperado.');
  return items;
}

export async function runApifyCollection(input:{
  queries:string[];country:string;resultsPerQuery:number;
}):Promise<Record<string,any>[]>{
  const selected=selectToken();
  const token=selected.token;
  console.log(`[APIFY] tokenSlot=${selected.slot} modo=${selected.mode}`);
  const actor=getActorId().replace('/','~');
  const keywords=[...new Set(input.queries.map(query=>query.trim()).filter(Boolean))];
  if(!keywords.length)throw new Error('Nenhuma palavra-chave vÃ¡lida foi informada para a coleta.');

  // maxAds Ã© o limite total desta execuÃ§Ã£o no Actor da jmlp.
  const maxAds=Math.max(1,Math.min(input.resultsPerQuery,1000));
  const startUrl=new URL(`${API_BASE}/acts/${actor}/runs`);
  startUrl.searchParams.set('waitForFinish','30');
  const startResponse=await apifyFetch(startUrl,token,{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({
      keywords,searchType:'keyword_unordered',country:input.country||'BR',activeStatus:'active',
      maxAds,maxConcurrency:1,raw:false,
      proxyConfiguration:{useApifyProxy:true,apifyProxyGroups:['RESIDENTIAL']},
    }),
  });
  let run=await responseData<ApifyRun>(startResponse,'Falha ao iniciar o Actor da Apify');
  if(!run.id)throw new Error('A Apify nÃ£o informou o ID da execuÃ§Ã£o.');

  const deadline=Date.now()+15*60_000;
  while(!TERMINAL_STATUSES.has(run.status)&&Date.now()<deadline){
    const statusUrl=new URL(`${API_BASE}/actor-runs/${run.id}`);
    statusUrl.searchParams.set('waitForFinish','30');
    const statusResponse=await apifyFetch(statusUrl,token,undefined,3);
    run=await responseData<ApifyRun>(statusResponse,'Falha ao consultar a execuÃ§Ã£o da Apify');
  }
  if(!TERMINAL_STATUSES.has(run.status))throw new Error(`A coleta ${run.id} continua na Apify apÃ³s 15 minutos. Consulte o run antes de executar novamente.`);
  if(run.status!=='SUCCEEDED')throw new Error(`A coleta ${run.id} terminou com status ${run.status}${run.statusMessage?`: ${run.statusMessage}`:''}.`);
  if(!run.defaultDatasetId)throw new Error(`A coleta ${run.id} terminou sem um Dataset associado.`);

  const datasetUrl=new URL(`${API_BASE}/datasets/${run.defaultDatasetId}/items`);
  datasetUrl.searchParams.set('clean','true');
  datasetUrl.searchParams.set('format','json');
  const datasetResponse=await apifyFetch(datasetUrl,token,undefined,3);
  const items=await responseData<Record<string,any>[]>(datasetResponse,'Falha ao baixar o Dataset da Apify');
  if(!Array.isArray(items))throw new Error('A Apify retornou um Dataset em formato inesperado.');
  return items;
}

