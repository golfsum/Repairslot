import type {MetadataRoute} from 'next';
import {allTopLevelSlugs} from '../lib/seo-library';
import {tools} from '../lib/tool-library';

export default function sitemap():MetadataRoute.Sitemap{
 const top=[...new Set(['repair-scheduling-software','repair-booking-software',...allTopLevelSlugs])];
 const toolSlugs=['missed-call-revenue-calculator',...tools.map(x=>x.slug)];
 return [
  {url:'https://repairslot.com/',changeFrequency:'weekly',priority:1},
  {url:'https://repairslot.com/resources',changeFrequency:'weekly',priority:.9},
  ...top.map(slug=>({url:`https://repairslot.com/${slug}`,changeFrequency:'monthly' as const,priority:.8})),
  ...toolSlugs.map(slug=>({url:`https://repairslot.com/tools/${slug}`,changeFrequency:'monthly' as const,priority:.75}))
 ];
}
