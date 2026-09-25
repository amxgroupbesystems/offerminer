import { buildNicheQueries } from './nicheQueries.ts';
import { getApifyDataset, getApifyRun, startApifyCollection } from './apifyClient.ts';
import { transformAdsToOffers } from './transformAds.ts';
import { keepValidatedLowTicketOffers } from './landingPageClassifier.ts';
import { OffersRepository } from './repositories/offersRepository.ts';
import { findDueSearches, claimSearch, createRun, findPendingRuns, finishSearch, releaseSearch, updateRun } from './schedulerRepository.ts';
import { supabaseAdmin } from './supabase.ts';

export async function startDueMining(limit=2){
  const candidates=await findDueSearches(Math.max(1,Math.min(limit,10))); let started=0;
  for(const candidate of candidates){
    const search=await claimSearch(candidate.id); if(!search)continue;
    let run:Awaited<ReturnType<typeof createRun>>|null=null;
    try{
      run=await createRun(search);
      const queries=buildNicheQueries(search.niche||search.name,search.keyword||'');
      const startedRun=await startApifyCollection({queries,country:search.country,resultsPerQuery:search.limit_results});
      await updateRun(run.id,{status:'running',provider_run_id:startedRun.runId,token_slot:startedRun.tokenSlot,started_at:new Date().toISOString(),query_count:queries.length});
      started++;
      console.log(`[AGENDADOR] pesquisa=${search.id} run=${run.id} apify=${startedRun.runId} consultas=${queries.length}`);
    }catch(error){
      if(run)await updateRun(run.id,{status:'failed',error_message:error instanceof Error?error.message:'Falha ao iniciar coleta',finished_at:new Date().toISOString()});
      await releaseSearch(search.id,search.user_id);
      console.error(`[AGENDADOR] falha ao iniciar pesquisa=${search.id}`,error);
    }
  }
  return {candidates:candidates.length,started};
}

export async function finishPendingMining(limit=10){
  const runs=await findPendingRuns(Math.max(1,Math.min(limit,25))); let completed=0,stillRunning=0;
  for(const run of runs){
    if(!run.provider_run_id||run.token_slot===null){
      if(Date.now()-new Date(run.created_at).getTime()>10*60_000){
        await updateRun(run.id,{status:'failed',error_message:'ExecuÃ§Ã£o nÃ£o recebeu ID da Apify.',finished_at:new Date().toISOString()});
        await releaseSearch(run.search_id,run.user_id);
      }
      continue;
    }
    try{
      const apifyRun=await getApifyRun(run.provider_run_id,run.token_slot);
      if(apifyRun.status==='RUNNING'||apifyRun.status==='READY'||apifyRun.status==='ABORTING'){stillRunning++;continue;}
      if(apifyRun.status!=='SUCCEEDED'){
        await updateRun(run.id,{status:apifyRun.status==='TIMED-OUT'?'timed_out':'failed',error_message:apifyRun.statusMessage||`Apify status ${apifyRun.status}`,finished_at:new Date().toISOString()});
        await releaseSearch(run.search_id,run.user_id); continue;
      }
      const {data:search,error}=await supabaseAdmin.from('monitored_searches').select('*').eq('id',run.search_id).eq('user_id',run.user_id).single();
      if(error||!search)throw new Error('Pesquisa associada nÃ£o encontrada.');
      const raw=await getApifyDataset(apifyRun,run.token_slot);
      const queries=buildNicheQueries(search.niche||search.name,search.keyword||'');
      const candidates=transformAdsToOffers(raw,search.niche||search.name,queries,new Date(),search.keyword||'');
      const offers=await keepValidatedLowTicketOffers(candidates);
      await OffersRepository.saveBatch(run.user_id,offers);
      await finishSearch(run.search_id,run.user_id,raw.length,offers.length,search.frequency);
      await updateRun(run.id,{status:'succeeded',raw_ads_count:raw.length,identified_offers_count:offers.length,finished_at:new Date().toISOString()});
      completed++;
    }catch(error){
      await updateRun(run.id,{status:'failed',error_message:error instanceof Error?error.message:'Falha ao finalizar coleta',finished_at:new Date().toISOString()});
      await releaseSearch(run.search_id,run.user_id);
      console.error(`[AGENDADOR] falha ao finalizar run=${run.id}`,error);
    }
  }
  return {pending:runs.length,completed,stillRunning};
}

