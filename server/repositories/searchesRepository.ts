import { supabaseAdmin } from '../supabase';
import type { MonitoredSearch, CreateSearchInput } from '../../src/types/search';

export class SearchesRepository {
  /**
   * Buscar todas as pesquisas monitoradas do usuário
   */
  static async getUserSearches(userId: string): Promise<MonitoredSearch[]> {
    const { data, error } = await supabaseAdmin
      .from('monitored_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SearchesRepository] Erro ao buscar pesquisas:', error);
      throw new Error(`Falha ao buscar pesquisas do banco: ${error.message}`);
    }

    return (data || []).map(this.mapToDomain);
  }

  /**
   * Buscar uma pesquisa monitorada por ID e usuário
   */
  static async getById(id: string, userId: string): Promise<MonitoredSearch | null> {
    const { data, error } = await supabaseAdmin
      .from('monitored_searches')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('[SearchesRepository] Erro ao buscar pesquisa por ID:', error);
      throw new Error(`Falha ao buscar pesquisa por ID: ${error.message}`);
    }

    return data ? this.mapToDomain(data) : null;
  }

  /**
   * Criar nova pesquisa monitorada para um usuário
   */
  static async create(userId: string, input: CreateSearchInput, queries: string[]): Promise<MonitoredSearch> {
    const now = new Date().toISOString();
    const niche = (input.niche || input.name || '').trim();

    const dbPayload = {
      user_id: userId,
      name: input.name || niche,
      keyword: input.keyword || '',
      niche: niche,
      queries: queries,
      country: input.country || 'BR',
      status: 'active',
      ad_status: 'ACTIVE',
      results_count: 0,
      identified_offers_count: 0,
      last_executed_at: null,
      next_execution_at: now,
      frequency: input.frequency || 'daily',
      limit_results: Math.max(1, Math.min(Number(input.limitResults) || 1000, 1000)),
    };

    const { data, error } = await supabaseAdmin
      .from('monitored_searches')
      .insert(dbPayload)
      .select('*')
      .single();

    if (error) {
      console.error('[SearchesRepository] Erro ao criar pesquisa:', error);
      throw new Error(`Falha ao criar pesquisa no banco: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  /**
   * Atualizar status da pesquisa (active / paused / running)
   */
  static async updateStatus(id: string, userId: string, status: 'active' | 'paused' | 'running'): Promise<MonitoredSearch> {
    const { data, error } = await supabaseAdmin
      .from('monitored_searches')
      .update({ status })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('[SearchesRepository] Erro ao atualizar status da pesquisa:', error);
      throw new Error(`Falha ao atualizar status da pesquisa: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  /**
   * Atualizar resultado de execução da pesquisa
   */
  static async updateRunResults(
    id: string,
    userId: string,
    resultsCount: number,
    offersCount: number,
    frequency: string
  ): Promise<MonitoredSearch> {
    const now = new Date();
    const intervalMs =
      frequency === 'hourly'
        ? 3600000
        : frequency === 'twice_daily'
        ? 43200000
        : frequency === 'weekly'
        ? 604800000
        : 86400000;

    const nextExecutionAt = new Date(now.getTime() + intervalMs).toISOString();

    const { data, error } = await supabaseAdmin
      .from('monitored_searches')
      .update({
        status: 'active',
        results_count: resultsCount,
        identified_offers_count: offersCount,
        last_executed_at: now.toISOString(),
        next_execution_at: nextExecutionAt,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('[SearchesRepository] Erro ao atualizar resultados da pesquisa:', error);
      throw new Error(`Falha ao atualizar resultados da pesquisa: ${error.message}`);
    }

    return this.mapToDomain(data);
  }

  /**
   * Mapear registro do banco para o modelo de domínio MonitoredSearch
   */
  private static mapToDomain(row: any): MonitoredSearch {
    return {
      id: row.id,
      name: row.name,
      keyword: row.keyword || '',
      niche: row.niche,
      queries: Array.isArray(row.queries) ? row.queries : [],
      country: row.country,
      status: row.status,
      adStatus: row.ad_status || 'ACTIVE',
      resultsCount: row.results_count || 0,
      identifiedOffersCount: row.identified_offers_count || 0,
      lastExecutedAt: row.last_executed_at ? new Date(row.last_executed_at).toISOString() : '',
      nextExecutionAt: row.next_execution_at ? new Date(row.next_execution_at).toISOString() : '',
      frequency: row.frequency,
      limitResults: row.limit_results,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
    };
  }
}
