const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();

export const PRODUCT_FORMATS=['ebook','e-book','guia','guia completo','guia prÃ¡tico','manual','apostila','checklist','planilha','planner','calendÃ¡rio','cronograma','cardÃ¡pio','lista','pack','pacote','kit','combo','templates','modelos','scripts','roteiro','prompts','mapa mental','infogrÃ¡fico','PDF','curso','minicurso','mini curso','aula','aula gravada','treinamento','workshop','desafio','mÃ©todo','protocolo','programa','passo a passo','Ã¡udio','Ã¡udios','meditaÃ§Ã£o','receitas','exercÃ­cios','atividades','fichas','material','biblioteca','comunidade','mentoria','ferramenta','calculadora'] as const;

export const OFFER_SIGNALS=['barato','acessÃ­vel','promoÃ§Ã£o','desconto','oferta','oferta especial','preÃ§o especial','apenas hoje','Ãºltimas vagas','acesso imediato','acesso vitalÃ­cio','entrega imediata','resultado rÃ¡pido','rÃ¡pido','simples','fÃ¡cil','prÃ¡tico','sem complicaÃ§Ã£o','do zero','para iniciantes','em casa','pelo celular','sem sair de casa','sem experiÃªncia','sem gastar muito','sem equipamento','poucos minutos','5 minutos','10 minutos','15 minutos','7 dias','14 dias','21 dias','30 dias','em uma semana','exclusivo','atualizado','2026','completo','comprovado','mÃ©todo simples','mÃ©todo prÃ¡tico','mÃ©todo rÃ¡pido','fÃ³rmula','segredo','estratÃ©gia','soluÃ§Ã£o','transformaÃ§Ã£o','resultado','economize','aprenda','descubra','domine','comece hoje','acesso agora','bÃ´nus','bÃ´nus exclusivo','garantia','promoÃ§Ã£o relÃ¢mpago','valor promocional'] as const;

export const LOW_TICKET_PATTERNS=['por apenas 10 reais','por apenas R$ 10','por apenas 9,90','tudo por apenas','mÃ©todo por apenas','pdf por apenas','kit completo','oferta especial','valor promocional','acesso imediato','acesso vitalÃ­cio','por apenas 10 + lovable.app'] as const;

const NICHE_SEEDS:Record<string,string[]>={
  'dinheiro e renda':['renda extra','ganhar dinheiro','organizar dinheiro','trabalhar pelo celular'],
  'marketing digital':['marketing digital','trÃ¡fego pago','copywriting','funil de vendas'],
  empreendedorismo:['empreender do zero','negÃ³cio prÃ³prio','pequenos negÃ³cios','plano de negÃ³cio'],
  'financas pessoais':['sair das dÃ­vidas','guardar dinheiro','planilha financeira','organizar finanÃ§as'],
  investimentos:['investir do zero','renda passiva','aÃ§Ãµes para iniciantes','educaÃ§Ã£o financeira'],
  emagrecimento:['perder barriga','emagrecer em casa','dieta simples','cardÃ¡pio para emagrecer'],
  fitness:['treino em casa','ganhar massa','exercÃ­cios sem equipamento','desafio fitness'],
  'alimentacao e nutricao':['alimentaÃ§Ã£o saudÃ¡vel','reeducaÃ§Ã£o alimentar','cardÃ¡pio saudÃ¡vel','nutriÃ§Ã£o prÃ¡tica'],
  culinaria:['receitas fÃ¡ceis','confeitaria','doces para vender','cozinha prÃ¡tica'],
  'desenvolvimento pessoal':['autoconfianÃ§a','hÃ¡bitos melhores','inteligÃªncia emocional','mudar de vida'],
  'sono e relaxamento':['dormir melhor','combater insÃ´nia','relaxamento profundo','meditaÃ§Ã£o para dormir'],
  relacionamentos:['salvar relacionamento','reconquistar','casamento feliz','comunicaÃ§Ã£o no casal'],
  'seducao e atracao':['atraÃ§Ã£o','conquista','seduÃ§Ã£o','confianÃ§a para encontros'],
  maternidade:['mÃ£e de primeira viagem','rotina do bebÃª','amamentaÃ§Ã£o','sono do bebÃª'],
  parentalidade:['educaÃ§Ã£o dos filhos','disciplina positiva','rotina infantil','comportamento infantil'],
  educacao:['alfabetizaÃ§Ã£o','atividades pedagÃ³gicas','educaÃ§Ã£o infantil','material para professor'],
  idiomas:['inglÃªs do zero','espanhol para iniciantes','aprender idiomas','conversaÃ§Ã£o'],
  'carreira e emprego':['conseguir emprego','currÃ­culo profissional','entrevista de emprego','mudar de carreira'],
  'concursos publicos':['passar em concurso','questÃµes comentadas','cronograma de estudos','apostila concurso'],
  'faculdade e estudos':['estudar melhor','TCC','resumos acadÃªmicos','mapa mental estudos'],
  tecnologia:['informÃ¡tica bÃ¡sica','programaÃ§Ã£o do zero','tecnologia para iniciantes','manutenÃ§Ã£o de computador'],
  'inteligencia artificial':['inteligÃªncia artificial','ChatGPT','prompts de IA','automaÃ§Ã£o com IA'],
  'redes sociais':['crescer no Instagram','conteÃºdo para redes sociais','engajamento','calendÃ¡rio de posts'],
  design:['Canva','design grÃ¡fico','identidade visual','artes editÃ¡veis'],
  'video e conteudo':['ediÃ§Ã£o de vÃ­deo','criaÃ§Ã£o de conteÃºdo','roteiro para vÃ­deos','Reels'],
  fotografia:['fotografia pelo celular','poses para fotos','ediÃ§Ã£o de fotos','fotografia profissional'],
  musica:['violÃ£o do zero','teclado para iniciantes','canto','teoria musical'],
  escrita:['escrita criativa','escrever livro','redaÃ§Ã£o','copy para iniciantes'],
  pets:['adestramento','cÃ£es e gatos','alimentaÃ§Ã£o pet','comportamento canino'],
  'casa e jardim':['horta em casa','decoraÃ§Ã£o','jardinagem','organizaÃ§Ã£o da casa'],
  'faca voce mesmo':['faÃ§a vocÃª mesmo','projetos DIY','reparos domÃ©sticos','marcenaria'],
  beleza:['skincare','maquiagem','cuidados com cabelo','beleza em casa'],
  'profissionais da beleza':['designer de sobrancelhas','manicure','extensÃ£o de cÃ­lios','cabeleireiro'],
  'moda e estilo':['consultoria de imagem','combinar roupas','guarda roupa cÃ¡psula','costura'],
  casamento:['organizar casamento','noiva','convites de casamento','casamento econÃ´mico'],
  viagens:['viajar barato','roteiro de viagem','milhas aÃ©reas','viagem internacional'],
  automotivo:['mecÃ¢nica automotiva','manutenÃ§Ã£o de carro','estÃ©tica automotiva','elÃ©trica automotiva'],
  motos:['mecÃ¢nica de motos','manutenÃ§Ã£o de moto','pilotagem','motociclista'],
  games:['melhorar nos jogos','setup gamer','streaming de games','jogos competitivos'],
  hobbies:['desenho','pintura','colecionismo','hobby criativo'],
  espiritualidade:['espiritualidade','meditaÃ§Ã£o','lei da atraÃ§Ã£o','autoconhecimento espiritual'],
  religiao:['bÃ­blia','devocional','oraÃ§Ã£o','estudo bÃ­blico'],
  'organizacao pessoal':['rotina organizada','planner pessoal','organizar a vida','hÃ¡bitos'],
  produtividade:['ser mais produtivo','gestÃ£o do tempo','foco','planejamento semanal'],
  'templates e ferramentas':['templates editÃ¡veis','planilhas prontas','ferramentas digitais','modelos Canva'],
  'b2b / empresas':['gestÃ£o empresarial','processos empresariais','consultoria B2B','indicadores de negÃ³cio'],
  vendas:['vender mais','tÃ©cnicas de vendas','prospecÃ§Ã£o','fechamento de vendas'],
  'mercado imobiliario':['corretor de imÃ³veis','vender imÃ³veis','captaÃ§Ã£o de imÃ³veis','investimento imobiliÃ¡rio'],
  'juridico educacional':['modelos jurÃ­dicos','prÃ¡tica jurÃ­dica','OAB','documentos jurÃ­dicos'],
  'contabilidade / fiscal':['contabilidade prÃ¡tica','impostos','MEI','planejamento tributÃ¡rio'],
  'profissionais de saude':['material para enfermagem','medicina','fisioterapia','gestÃ£o de consultÃ³rio'],
  'negocios locais':['atrair clientes locais','Google Meu NegÃ³cio','marketing local','agenda cheia'],
  'delivery e gastronomia':['delivery lucrativo','cardÃ¡pio para delivery','precificaÃ§Ã£o de alimentos','gastronomia'],
  'e-commerce':['loja virtual','vender online','Shopify','produto vencedor'],
  marketplace:['vender na Shopee','Mercado Livre','marketplace do zero','catÃ¡logo de produtos'],
  'print on demand':['print on demand','estampas para camisetas','POD','camisetas personalizadas'],
  personalizados:['papelaria personalizada','sublimaÃ§Ã£o','topo de bolo','personalizados para festas'],
  freelancer:['trabalhar como freelancer','conseguir clientes','portfÃ³lio freelancer','serviÃ§os online'],
  'saas e software':['criar SaaS','micro SaaS','software por assinatura','Lovable'],
  'lideranca e gestao':['lideranÃ§a','gestÃ£o de equipes','gestÃ£o de pessoas','feedback'],
  logistica:['gestÃ£o de estoque','logÃ­stica','controle de entregas','cadeia de suprimentos'],
  'documentos e modelos':['documentos prontos','contratos editÃ¡veis','modelos de documentos','declaraÃ§Ãµes'],
  'festas e eventos':['organizar festas','decoraÃ§Ã£o de festa','cerimonial','eventos lucrativos'],
  artesanato:['artesanato','moldes','crochÃª','costura criativa'],
  'renda extra com alimentacao':['doces para vender','marmitas','bolo no pote','renda com comida'],
  'renda extra com servicos':['serviÃ§os para vender','trabalhar por conta','prestaÃ§Ã£o de serviÃ§os','renda em casa'],
  'conteudo infantil educacional':['atividades infantis','alfabetizaÃ§Ã£o infantil','jogos educativos','material infantil'],
  'terceira idade':['exercÃ­cios para idosos','memÃ³ria na terceira idade','qualidade de vida idoso','cuidador de idosos'],
  'imigracao e vida no exterior':['morar no exterior','imigraÃ§Ã£o','visto','trabalhar fora do Brasil'],
  infoprodutos:['criar infoproduto','vender ebook','produto digital','lanÃ§amento digital'],
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
  ['como melhorar','como aprender','como conseguir','como evitar','segredo','fÃ³rmula','protocolo','programa'].forEach(prefix=>add(`${prefix} ${seeds[0]}`));
  seeds.slice(1).forEach(seed=>{add(`ebook ${seed}`);add(`guia ${seed}`);add(`mÃ©todo ${seed}`);add(`${seed} para iniciantes`);});
  LOW_TICKET_PATTERNS.forEach(pattern=>add(`${seeds[0]} ${pattern}`));
  return [...queries].slice(0,96);
}

export function buildMetaLibraryUrl(keyword:string,country='BR'):string{
  const params=new URLSearchParams({active_status:'active',ad_type:'all',country,is_targeted_country:'false',media_type:'all',q:keyword,search_type:'keyword_unordered'});
  params.set('sort_data[mode]','total_impressions');params.set('sort_data[direction]','desc');
  return `https://www.facebook.com/ads/library/?${params}`;
}

