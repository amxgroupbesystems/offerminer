const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();

export const PRODUCT_FORMATS=['ebook','e-book','guia','guia completo','guia prático','manual','apostila','checklist','planilha','planner','calendário','cronograma','cardápio','lista','pack','pacote','kit','combo','templates','modelos','scripts','roteiro','prompts','mapa mental','infográfico','PDF','curso','minicurso','mini curso','aula','aula gravada','treinamento','workshop','desafio','método','protocolo','programa','passo a passo','áudio','áudios','meditação','receitas','exercícios','atividades','fichas','material','biblioteca','comunidade','mentoria','ferramenta','calculadora'] as const;

export const OFFER_SIGNALS=['barato','acessível','promoção','desconto','oferta','oferta especial','preço especial','apenas hoje','últimas vagas','acesso imediato','acesso vitalício','entrega imediata','resultado rápido','rápido','simples','fácil','prático','sem complicação','do zero','para iniciantes','em casa','pelo celular','sem sair de casa','sem experiência','sem gastar muito','sem equipamento','poucos minutos','5 minutos','10 minutos','15 minutos','7 dias','14 dias','21 dias','30 dias','em uma semana','exclusivo','atualizado','2026','completo','comprovado','método simples','método prático','método rápido','fórmula','segredo','estratégia','solução','transformação','resultado','economize','aprenda','descubra','domine','comece hoje','acesso agora','bônus','bônus exclusivo','garantia','promoção relâmpago','valor promocional'] as const;

export const LOW_TICKET_PATTERNS=['por apenas 10 reais','por apenas R$ 10','por apenas 9,90','tudo por apenas','método por apenas','pdf por apenas','kit completo','oferta especial','valor promocional','acesso imediato','acesso vitalício','por apenas 10 + lovable.app'] as const;

const NICHE_SEEDS:Record<string,string[]>={
  'dinheiro e renda':['renda extra','ganhar dinheiro','organizar dinheiro','trabalhar pelo celular'],
  'marketing digital':['marketing digital','tráfego pago','copywriting','funil de vendas'],
  empreendedorismo:['empreender do zero','negócio próprio','pequenos negócios','plano de negócio'],
  'financas pessoais':['sair das dívidas','guardar dinheiro','planilha financeira','organizar finanças'],
  investimentos:['investir do zero','renda passiva','ações para iniciantes','educação financeira'],
  emagrecimento:['perder barriga','emagrecer em casa','dieta simples','cardápio para emagrecer'],
  fitness:['treino em casa','ganhar massa','exercícios sem equipamento','desafio fitness'],
  'alimentacao e nutricao':['alimentação saudável','reeducação alimentar','cardápio saudável','nutrição prática'],
  culinaria:['receitas fáceis','confeitaria','doces para vender','cozinha prática'],
  'desenvolvimento pessoal':['autoconfiança','hábitos melhores','inteligência emocional','mudar de vida'],
  'sono e relaxamento':['dormir melhor','combater insônia','relaxamento profundo','meditação para dormir'],
  relacionamentos:['salvar relacionamento','reconquistar','casamento feliz','comunicação no casal'],
  'seducao e atracao':['atração','conquista','sedução','confiança para encontros'],
  maternidade:['mãe de primeira viagem','rotina do bebê','amamentação','sono do bebê'],
  parentalidade:['educação dos filhos','disciplina positiva','rotina infantil','comportamento infantil'],
  educacao:['alfabetização','atividades pedagógicas','educação infantil','material para professor'],
  idiomas:['inglês do zero','espanhol para iniciantes','aprender idiomas','conversação'],
  'carreira e emprego':['conseguir emprego','currículo profissional','entrevista de emprego','mudar de carreira'],
  'concursos publicos':['passar em concurso','questões comentadas','cronograma de estudos','apostila concurso'],
  'faculdade e estudos':['estudar melhor','TCC','resumos acadêmicos','mapa mental estudos'],
  tecnologia:['informática básica','programação do zero','tecnologia para iniciantes','manutenção de computador'],
  'inteligencia artificial':['inteligência artificial','ChatGPT','prompts de IA','automação com IA'],
  'redes sociais':['crescer no Instagram','conteúdo para redes sociais','engajamento','calendário de posts'],
  design:['Canva','design gráfico','identidade visual','artes editáveis'],
  'video e conteudo':['edição de vídeo','criação de conteúdo','roteiro para vídeos','Reels'],
  fotografia:['fotografia pelo celular','poses para fotos','edição de fotos','fotografia profissional'],
  musica:['violão do zero','teclado para iniciantes','canto','teoria musical'],
  escrita:['escrita criativa','escrever livro','redação','copy para iniciantes'],
  pets:['adestramento','cães e gatos','alimentação pet','comportamento canino'],
  'casa e jardim':['horta em casa','decoração','jardinagem','organização da casa'],
  'faca voce mesmo':['faça você mesmo','projetos DIY','reparos domésticos','marcenaria'],
  beleza:['skincare','maquiagem','cuidados com cabelo','beleza em casa'],
  'profissionais da beleza':['designer de sobrancelhas','manicure','extensão de cílios','cabeleireiro'],
  'moda e estilo':['consultoria de imagem','combinar roupas','guarda roupa cápsula','costura'],
  casamento:['organizar casamento','noiva','convites de casamento','casamento econômico'],
  viagens:['viajar barato','roteiro de viagem','milhas aéreas','viagem internacional'],
  automotivo:['mecânica automotiva','manutenção de carro','estética automotiva','elétrica automotiva'],
  motos:['mecânica de motos','manutenção de moto','pilotagem','motociclista'],
  games:['melhorar nos jogos','setup gamer','streaming de games','jogos competitivos'],
  hobbies:['desenho','pintura','colecionismo','hobby criativo'],
  espiritualidade:['espiritualidade','meditação','lei da atração','autoconhecimento espiritual'],
  religiao:['bíblia','devocional','oração','estudo bíblico'],
  'organizacao pessoal':['rotina organizada','planner pessoal','organizar a vida','hábitos'],
  produtividade:['ser mais produtivo','gestão do tempo','foco','planejamento semanal'],
  'templates e ferramentas':['templates editáveis','planilhas prontas','ferramentas digitais','modelos Canva'],
  'b2b / empresas':['gestão empresarial','processos empresariais','consultoria B2B','indicadores de negócio'],
  vendas:['vender mais','técnicas de vendas','prospecção','fechamento de vendas'],
  'mercado imobiliario':['corretor de imóveis','vender imóveis','captação de imóveis','investimento imobiliário'],
  'juridico educacional':['modelos jurídicos','prática jurídica','OAB','documentos jurídicos'],
  'contabilidade / fiscal':['contabilidade prática','impostos','MEI','planejamento tributário'],
  'profissionais de saude':['material para enfermagem','medicina','fisioterapia','gestão de consultório'],
  'negocios locais':['atrair clientes locais','Google Meu Negócio','marketing local','agenda cheia'],
  'delivery e gastronomia':['delivery lucrativo','cardápio para delivery','precificação de alimentos','gastronomia'],
  'e-commerce':['loja virtual','vender online','Shopify','produto vencedor'],
  marketplace:['vender na Shopee','Mercado Livre','marketplace do zero','catálogo de produtos'],
  'print on demand':['print on demand','estampas para camisetas','POD','camisetas personalizadas'],
  personalizados:['papelaria personalizada','sublimação','topo de bolo','personalizados para festas'],
  freelancer:['trabalhar como freelancer','conseguir clientes','portfólio freelancer','serviços online'],
  'saas e software':['criar SaaS','micro SaaS','software por assinatura','Lovable'],
  'lideranca e gestao':['liderança','gestão de equipes','gestão de pessoas','feedback'],
  logistica:['gestão de estoque','logística','controle de entregas','cadeia de suprimentos'],
  'documentos e modelos':['documentos prontos','contratos editáveis','modelos de documentos','declarações'],
  'festas e eventos':['organizar festas','decoração de festa','cerimonial','eventos lucrativos'],
  artesanato:['artesanato','moldes','crochê','costura criativa'],
  'renda extra com alimentacao':['doces para vender','marmitas','bolo no pote','renda com comida'],
  'renda extra com servicos':['serviços para vender','trabalhar por conta','prestação de serviços','renda em casa'],
  'conteudo infantil educacional':['atividades infantis','alfabetização infantil','jogos educativos','material infantil'],
  'terceira idade':['exercícios para idosos','memória na terceira idade','qualidade de vida idoso','cuidador de idosos'],
  'imigracao e vida no exterior':['morar no exterior','imigração','visto','trabalhar fora do Brasil'],
  infoprodutos:['criar infoproduto','vender ebook','produto digital','lançamento digital'],
};

export function getNicheSeeds(niche:string):string[]{
  const clean=niche.trim();
  return NICHE_SEEDS[normalize(clean)]??[clean];
}

export function buildNicheQueries(niche:string,customKeyword?:string):string[]{
  const cleanNiche=niche.trim();
  const seeds=getNicheSeeds(cleanNiche);
  const queries=new Set<string>();
  const add=(query:string)=>{const clean=query.replace(/\s+/g,' ').trim();if(clean)queries.add(clean);};
  if(customKeyword?.trim()){add(customKeyword);add(`${customKeyword} ${cleanNiche}`);}
  seeds.forEach(add);
  PRODUCT_FORMATS.forEach(format=>add(`${format} ${seeds[0]}`));
  OFFER_SIGNALS.slice(0,24).forEach(signal=>add(`${seeds[0]} ${signal}`));
  ['como melhorar','como aprender','como conseguir','como evitar','segredo','fórmula','protocolo','programa'].forEach(prefix=>add(`${prefix} ${seeds[0]}`));
  seeds.slice(1).forEach(seed=>{add(`ebook ${seed}`);add(`guia ${seed}`);add(`método ${seed}`);add(`${seed} para iniciantes`);});
  LOW_TICKET_PATTERNS.forEach(pattern=>add(`${seeds[0]} ${pattern}`));
  return [...queries].slice(0,96);
}

export function buildMetaLibraryUrl(keyword:string,country='BR'):string{
  const params=new URLSearchParams({active_status:'active',ad_type:'all',country,is_targeted_country:'false',media_type:'all',q:keyword,search_type:'keyword_unordered'});
  params.set('sort_data[mode]','total_impressions');params.set('sort_data[direction]','desc');
  return `https://www.facebook.com/ads/library/?${params}`;
}
