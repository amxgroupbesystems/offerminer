import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import type { Offer } from '../src/types/offer';
import { transformAdsToOffers } from './transformAds';
import { keepValidatedLowTicketOffers } from './landingPageClassifier';
import { readJson, writeJson } from './store';

dotenv.config({ path: ['.env.local', '.env'] });

const [file,niche='Não classificado',keyword='importação manual']=process.argv.slice(2);
if(!file)throw new Error('Uso: npm run import:apify -- caminho.json "Nicho" "keyword"');
const raw=JSON.parse(await fs.readFile(file,'utf8'));
if(!Array.isArray(raw))throw new Error('O arquivo precisa conter uma lista de anúncios.');
const candidates=transformAdsToOffers(raw,niche,[keyword]);
const fresh=await keepValidatedLowTicketOffers(candidates), current=await readJson<Offer[]>('catalog.json',[]), merged=new Map(current.map(o=>[o.id,o]));
fresh.forEach(o=>merged.set(o.id,o));await writeJson('catalog.json',[...merged.values()]);
console.log(`Importados ${raw.length} anúncios, ${candidates.length} candidatos e ${fresh.length} ofertas low ticket validadas.`);
