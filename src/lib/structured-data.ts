import type { Profile } from '@/data/profile';

type Node = Record<string, unknown> & { '@type': string };

// schema.org data for the home page, so search engines can show name, role and links.
// Contact details stay out on purpose.
export function homeJsonLd(profile: Profile, siteUrl: string) {
  const person: Node = {
    '@type': 'Person',
    '@id': `${siteUrl}#person`,
    name: profile.name,
    url: siteUrl,
    jobTitle: profile.jobTitle,
    worksFor: { '@type': 'Organization', name: profile.employer },
    alumniOf: { '@type': 'CollegeOrUniversity', name: profile.school },
    sameAs: profile.socials.map((s) => s.href),
  };
  const website: Node = {
    '@type': 'WebSite',
    url: siteUrl,
    name: profile.name,
    author: { '@id': `${siteUrl}#person` },
  };
  return { '@context': 'https://schema.org', '@graph': [person, website] };
}
