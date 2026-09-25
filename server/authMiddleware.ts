import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabase';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso não autorizado: token JWT ausente.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Acesso não autorizado: token inválido ou expirado.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE] Erro ao validar JWT:', error);
    return res.status(401).json({ message: 'Acesso não autorizado: falha ao validar token.' });
  }
}
