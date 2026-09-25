/**
 * Gerador de thumbnails visuais SVG locais para criativos e páginas de vendas.
 * 100% offline, sem dependência de imagens externas, com visual profissional e moderno.
 */

export function generateCreativeThumbnail(
  title: string,
  niche: string,
  type: 'image' | 'video' | 'carousel' | 'dynamic',
  ticket?: number | null,
  gradientType: number = 0
): string {
  const gradients = [
    { start: '#1e293b', mid: '#0f172a', end: '#0284c7', accent: '#38bdf8' },
    { start: '#1e1b4b', mid: '#0f172a', end: '#4338ca', accent: '#818cf8' },
    { start: '#064e3b', mid: '#022c22', end: '#0d9488', accent: '#2dd4bf' },
    { start: '#701a75', mid: '#3b0764', end: '#c026d3', accent: '#f472b6' },
    { start: '#7c2d12', mid: '#451a03', end: '#ea580c', accent: '#fb923c' },
    { start: '#134e4a', mid: '#042f2e', end: '#0891b2', accent: '#38bdf8' },
    { start: '#312e81', mid: '#1e1b4b', end: '#6366f1', accent: '#a5b4fc' },
  ];

  const g = gradients[gradientType % gradients.length];
  const ticketStr = ticket ? `R$ ${ticket.toFixed(2).replace('.', ',')}` : 'ACESSO IMEDIATO';
  const typeIcon = type === 'video' ? '▶ VÍDEO REELS' : type === 'carousel' ? '❖ CARROSSEL (4 TELAS)' : '✦ CRIATIVO ESTÁTICO';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      <defs>
        <linearGradient id="bg-${gradientType}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${g.start}"/>
          <stop offset="60%" stop-color="${g.mid}"/>
          <stop offset="100%" stop-color="${g.end}"/>
        </linearGradient>
        <pattern id="grid-${gradientType}" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#ffffff" fill-opacity="0.07"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(#bg-${gradientType})" rx="8"/>
      <rect width="400" height="300" fill="url(#grid-${gradientType})" rx="8"/>
      
      <!-- Top badge -->
      <rect x="20" y="20" width="110" height="24" rx="12" fill="#0f172a" fill-opacity="0.8" stroke="${g.accent}" stroke-width="1"/>
      <text x="75" y="36" fill="${g.accent}" font-family="system-ui, sans-serif" font-size="10" font-weight="700" text-anchor="middle">${niche.toUpperCase()}</text>
      
      <!-- Format pill -->
      <rect x="250" y="20" width="130" height="24" rx="12" fill="#000000" fill-opacity="0.6"/>
      <text x="315" y="36" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="middle">${typeIcon}</text>

      <!-- Center Preview content -->
      <g transform="translate(30, 80)">
        <rect x="0" y="0" width="340" height="130" rx="8" fill="#000000" fill-opacity="0.45" stroke="#ffffff" stroke-opacity="0.1"/>
        <text x="20" y="40" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="800">
          ${escapeXml(title.slice(0, 32))}
        </text>
        <text x="20" y="65" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="400">
          Material Completo em PDF + Acesso Vitalício
        </text>

        <!-- CTA Box -->
        <rect x="20" y="85" width="140" height="28" rx="6" fill="${g.accent}" />
        <text x="90" y="103" fill="#090d16" font-family="system-ui, sans-serif" font-size="11" font-weight="800" text-anchor="middle">
          ${ticketStr}
        </text>

        ${type === 'video' ? `
          <circle cx="280" cy="65" r="24" fill="#000000" fill-opacity="0.6" stroke="#ffffff" stroke-width="2"/>
          <polygon points="274,53 292,65 274,77" fill="#ffffff"/>
        ` : `
          <circle cx="280" cy="65" r="22" fill="${g.accent}" fill-opacity="0.2"/>
          <text x="280" y="70" fill="${g.accent}" font-family="system-ui, sans-serif" font-size="18" text-anchor="middle">★</text>
        `}
      </g>

      <!-- Footer preview bar -->
      <text x="20" y="275" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">Anunciado na Meta Ads Library</text>
      <circle cx="370" cy="272" r="4" fill="#10b981"/>
      <text x="360" y="275" fill="#10b981" font-family="system-ui, sans-serif" font-size="10" font-weight="600" text-anchor="end">ANÚNCIO ATIVO</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateSalesPageScreenshot(
  title: string,
  domain: string,
  ticket: number | null,
  tech: string
): string {
  const ticketStr = ticket ? `R$ ${ticket.toFixed(2).replace('.', ',')}` : 'Oferta Especial';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#0b0f19"/>
      <!-- Browser Top Bar -->
      <rect width="600" height="38" fill="#161e2e"/>
      <circle cx="20" cy="19" r="5" fill="#ef4444"/>
      <circle cx="36" cy="19" r="5" fill="#eab308"/>
      <circle cx="52" cy="19" r="5" fill="#22c55e"/>
      <rect x="80" y="8" width="440" height="22" rx="4" fill="#090d16"/>
      <text x="100" y="23" fill="#64748b" font-family="system-ui, sans-serif" font-size="11">🔒 https://${domain}</text>
      <text x="560" y="23" fill="#0284c7" font-family="system-ui, sans-serif" font-size="10" font-weight="bold">${tech}</text>
      
      <!-- Page Hero Content -->
      <rect x="30" y="60" width="540" height="8" rx="4" fill="#0284c7" fill-opacity="0.8"/>
      
      <text x="300" y="110" fill="#ffffff" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" text-anchor="middle">${escapeXml(title.slice(0, 42))}</text>
      <text x="300" y="135" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="13" text-anchor="middle">Aprenda o passo a passo com nosso método prático e direto ao ponto.</text>

      <!-- Mock Video/Hero Box -->
      <rect x="90" y="155" width="420" height="150" rx="8" fill="#131926" stroke="#1e293b"/>
      <circle cx="300" cy="230" r="28" fill="#ef4444"/>
      <polygon points="294,216 312,230 294,244" fill="#ffffff"/>
      <text x="300" y="280" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12" text-anchor="middle">Assista a apresentação (3 min)</text>

      <!-- Checkout Box -->
      <rect x="180" y="325" width="240" height="50" rx="8" fill="#10b981"/>
      <text x="300" y="348" fill="#06251d" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">GARANTIR ACESSO POR APENAS</text>
      <text x="300" y="366" fill="#06251d" font-family="system-ui, sans-serif" font-size="16" font-weight="900" text-anchor="middle">${ticketStr}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
