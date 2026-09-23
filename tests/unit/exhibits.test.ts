import { describe, expect, it } from 'vitest';
import {
  catalogNumber,
  displayTitle,
  indexPageFor,
  indexPath,
  pad3,
  paginate,
  publishedInOrder,
  type ExhibitLike,
} from '../../src/lib/exhibits';

const entry = (id: string, status: ExhibitLike['data']['status'] = 'published', title?: string): ExhibitLike => ({
  id,
  data: { status, ...(title ? { title } : {}) },
});

const fixtures: ExhibitLike[] = [
  ...Array.from({ length: 40 }, (_, i) => entry(pad3(i + 1))),
  entry('041', 'draft'),
  entry('042', 'unpublished'),
];

describe('titles', () => {
  it('uses the custom title when set', () => {
    expect(displayTitle(entry('017', 'published', 'The Seventeenth Square'))).toBe('The Seventeenth Square');
  });
  it('falls back to the numbered title', () => {
    expect(displayTitle(entry('005'))).toBe('Exhibit No. 005');
  });
  it('pads to at least three digits', () => {
    expect(pad3(7)).toBe('007');
    expect(pad3(1234)).toBe('1234');
  });
  it('rejects ids that are not catalog numbers', () => {
    expect(() => catalogNumber('abc')).toThrow();
    expect(() => catalogNumber('000')).toThrow();
  });
});

describe('ordering and pagination', () => {
  const ordered = publishedInOrder(fixtures);
  it('keeps only published exhibits, newest first', () => {
    expect(ordered).toHaveLength(40);
    expect(ordered[0].id).toBe('040');
    expect(ordered.at(-1)?.id).toBe('001');
  });
  it('splits 40 exhibits into pages of 12/12/12/4', () => {
    expect(paginate(ordered).map((p) => p.length)).toEqual([12, 12, 12, 4]);
  });
  it('finds the index page an exhibit is on', () => {
    expect(indexPageFor(40, ordered)).toBe(1);
    expect(indexPageFor(28, ordered)).toBe(2);
    expect(indexPageFor(4, ordered)).toBe(4);
  });
  it('builds index paths', () => {
    expect(indexPath(1)).toBe('/');
    expect(indexPath(3)).toBe('/page/3/');
  });
});
