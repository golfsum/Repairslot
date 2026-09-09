import type { MetadataRoute } from 'next';

const industryPages = [
  'appliance-repair-scheduling-software',
  'garage-door-repair-scheduling-software',
  'mobile-mechanic-scheduling-software',
  'hvac-repair-scheduling-software',
  'plumbing-repair-scheduling-software',
  'handyman-scheduling-software',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: 'https://repairslot.com/',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...industryPages.map((slug) => ({
      url: `https://repairslot.com/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
