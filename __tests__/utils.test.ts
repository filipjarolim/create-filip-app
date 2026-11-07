import { cn } from '../lib/utils';

describe('cn', () => {
  it('lets the later Tailwind class win', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('drops conditional classes that are false', () => {
    expect(cn('flex', false && 'hidden', 'flex-row')).toBe('flex flex-row');
  });
});
