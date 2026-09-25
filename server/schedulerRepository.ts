import { supabaseAdmin } from './supabase.ts';

export type DueSearchRow={id:string;user_id:string;name:string;keyword:string|null;niche:string;queries:any[];country:string;status:string;frequency:string;limit_results:number;next_execution_at:string|null};
export type RunRow={id:string;user_id:string;search_id:string;status:string;provider_run_id:string|null;token_slot:number|null;started_at:string|null;created_at:string};

export async function findDueSearches(limit:number):Promise<DueSearchRow[]>{
  const {data,error}=await supabaseAdmin.from('monitored_searches').select('id,user_id,name,keyword,niche,queries,country,status,frequency,limit_results,next_execution_at').eq('status','active').or(`next_execution_at.is.null,next_execution_at.lte.${new Date().toISOString()}`).order('next_execution_at',{ascending:true,nullsFirst:true}).limit(limit);
  if(error)throw new Error(`Falha ao buscar pesquisas vencidas: ${error.message}`);
  return (data||[]) as DueSearchRow[];
}

export async function claimSearch(id:string):Promise<DueSearchRow|null>{
  const {data,error}=await supabaseAdmin.from('monitored_searches').update({status:'running'}).eq('id',id).eq('status','active').select('id,user_id,name,keyword,niche,queries,country,status,frequency,limit_results,next_execution_at').maybeSingle();
  if(error)throw new Error(`Falha ao reservar pesquisa: ${error.message}`);
  return data as DueSearchRow|null;
}

export async function createRun(search:DueSearchRow):Promise<RunRow>{
  const {data,error}=await supabaseAdmin.from('search_runs').insert({user_id:search.user_id,search_id:search.id,status:'queued',provider:'apify',query_count:Array.isArray(search.queries)?search.queries.length:0,requested_limit:search.limit_results}).select('*').single();
  if(error)throw new Error(`Falha ao registrar execuÃ§Ã£o: ${error.message}`);
  return data as RunRow;
}

export async function updateRun(id:string,patch:Record<string,unknown>):Promise<void>{
  const {error}=await supabaseAdmin.from('search_runs').update(patch).eq('id',id);
  if(error)throw new Error(`Falha ao atualizar execuÃ§Ã£o: ${error.message}`);
}

export async function findPendingRuns(limit:number):Promise<RunRow[]>{
  const {data,error}=await supabaseAdmin.from('search_runs').select('*').in('status',['queued','running']).order('created_at',{ascending:true}).limit(limit);
  if(error)throw new Error(`Falha ao buscar execuÃ§Ãµes pendentes: ${error.message}`);
  return (data||[]) as RunRow[];
}

export async function finishSearch(searchId:string,userId:string,resultsCount:number,offersCount:number,frequency:string):Promise<void>{
  const interval=frequency==='twice_daily'?'12 hours':frequency==='hourly'?'1 hour':frequency==='weekly'?'7 days':'24 hours';
  const {error}=await supabaseAdmin.from('monitored_searches').update({status:'active',results_count:resultsCount,identified_offers_count:offersCount,last_executed_at:new Date().toISOString(),next_execution_at:new Date(Date.now()+({ '12 hours':43200000,'1 hour':3600000,'7 days':604800000,'24 hours':86400000 } as Record<string,number>)[interval]).toISOString()}).eq('id',searchId).eq('user_id',userId);
  if(error)throw new Error(`Falha ao agendar prÃ³xima execuÃ§Ã£o: ${error.message}`);
}

export async function releaseSearch(searchId:string,userId:string):Promise<void>{
  await supabaseAdmin.from('monitored_searches').update({status:'active'}).eq('id',searchId).eq('user_id',userId).eq('status','running');
}

