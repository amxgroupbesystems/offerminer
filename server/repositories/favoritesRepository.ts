import { supabaseAdmin } from '../supabase';

export class FavoritesRepository {
  /**
   * Buscar IDs de ofertas favoritadas pelo usuário
   */
  static async getUserFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('favorites')
      .select('offer_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[FavoritesRepository] Erro ao buscar favoritos:', error);
      throw new Error(`Falha ao buscar favoritos: ${error.message}`);
    }

    return (data || []).map((row) => row.offer_id);
  }

  /**
   * Alternar estado de favorito de uma oferta para o usuário
   */
  static async toggleFavorite(userId: string, offerId: string): Promise<boolean> {
    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('offer_id')
      .eq('user_id', userId)
      .eq('offer_id', offerId)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('offer_id', offerId);

      if (error) {
        console.error('[FavoritesRepository] Erro ao remover favorito:', error);
        throw new Error(`Falha ao remover favorito: ${error.message}`);
      }

      return false; // Agora não é mais favorito
    } else {
      const { error } = await supabaseAdmin
        .from('favorites')
        .insert({ user_id: userId, offer_id: offerId });

      if (error) {
        console.error('[FavoritesRepository] Erro ao adicionar favorito:', error);
        throw new Error(`Falha ao adicionar favorito: ${error.message}`);
      }

      return true; // Agora é favorito
    }
  }
}
