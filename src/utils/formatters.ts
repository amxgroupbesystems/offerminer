export function formatCurrency(amount: number | null, currency: 'BRL' | 'USD' | 'EUR' = 'BRL'): string {
  if (amount === null || amount === undefined) {
    return 'Não identificado';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeDays(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Há 1 dia';
  return `${days} dias`;
}

export function formatDaysActive(days: number): string {
  return `${days} ${days === 1 ? 'dia ativo' : 'dias ativos'}`;
}

export function getStatusLabel(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'scaling':
      return {
        label: 'Escalando',
        bg: 'bg-amber-500/15',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'monitored':
      return {
        label: 'Monitorada',
        bg: 'bg-cyan-500/15',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
      };
    case 'recent':
      return {
        label: 'Recente',
        bg: 'bg-emerald-500/15',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
      };
    case 'inactive':
      return {
        label: 'Inativa',
        bg: 'bg-slate-500/15',
        text: 'text-slate-400',
        border: 'border-slate-500/30',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-700/30',
        text: 'text-slate-300',
        border: 'border-slate-700',
      };
  }
}

export function getFunnelLabel(type: string): string {
  switch (type) {
    case 'sales_page':
      return 'Página de vendas';
    case 'quiz':
      return 'Quiz';
    case 'whatsapp':
      return 'WhatsApp';
    case 'app':
      return 'Aplicativo';
    case 'direct_checkout':
      return 'Checkout direto';
    default:
      return type;
  }
}

export function getCreativeFormatLabel(format: string): string {
  switch (format) {
    case 'image':
      return 'Imagem';
    case 'video':
      return 'Vídeo';
    case 'carousel':
      return 'Carrossel';
    case 'dynamic':
      return 'Dinâmico';
    default:
      return format;
  }
}

export function getPlatformLabel(platform: string): string {
  switch (platform) {
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'messenger':
      return 'Messenger';
    case 'audience_network':
      return 'Audience Network';
    case 'threads':
      return 'Threads';
    default:
      return platform;
  }
}
