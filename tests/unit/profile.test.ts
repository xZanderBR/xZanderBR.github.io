import { expect, test } from 'vitest';
import { profile } from '@/data/profile';

// Stays red until Zander adds his contact address to src/data/profile.ts.
test('profile has a contact email', () => {
  expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
});
