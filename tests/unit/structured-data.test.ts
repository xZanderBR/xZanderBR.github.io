import { expect, test } from 'vitest';
import { homeJsonLd } from '@/lib/structured-data';
import { profile } from '@/data/profile';

const graph = homeJsonLd(profile, 'https://xzanderbr.github.io/');
const person = graph['@graph'].find((n) => n['@type'] === 'Person')!;

test('describes the person from the profile data', () => {
  expect(graph['@context']).toBe('https://schema.org');
  expect(person).toMatchObject({
    name: 'Zander Barajas',
    url: 'https://xzanderbr.github.io/',
    jobTitle: 'Software Engineer',
    worksFor: { '@type': 'Organization', name: 'Envision Engineering' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'San Diego State University' },
    sameAs: ['https://github.com/xZanderBR', 'https://www.linkedin.com/in/xzanderbr'],
  });
});

test('includes the website and never contact details', () => {
  expect(graph['@graph'].some((n) => n['@type'] === 'WebSite')).toBe(true);
  const json = JSON.stringify(graph);
  expect(json).not.toMatch(/email|telephone|@[a-z]+\.[a-z]/i);
});
