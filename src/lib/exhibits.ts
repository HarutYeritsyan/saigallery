export const PAGE_SIZE = 12;

export type ExhibitStatus = 'draft' | 'published' | 'unpublished';

/** The minimal shape these helpers need; content entries satisfy it. */
export interface ExhibitLike {
  id: string;
  data: { status: ExhibitStatus; title?: string };
}

/** Parses a filename stem such as "017" into its catalog number. */
export function catalogNumber(id: string): number {
  if (!/^\d+$/.test(id)) throw new Error(`Exhibit id "${id}" is not a catalog number`);
  const n = Number.parseInt(id, 10);
  if (n < 1) throw new Error(`Exhibit id "${id}" must be 1 or greater`);
  return n;
}

export function pad3(n: number): string {
  return String(n).padStart(3, '0');
}

export function defaultTitle(n: number): string {
  return `Exhibit No. ${pad3(n)}`;
}

/** The curator's title when set, otherwise "Exhibit No. NNN" (FR-012). */
export function displayTitle(entry: ExhibitLike): string {
  return entry.data.title ?? defaultTitle(catalogNumber(entry.id));
}

/** Published exhibits only, newest catalog number first, the same for every visitor (FR-001). */
export function publishedInOrder<T extends ExhibitLike>(entries: T[]): T[] {
  return entries
    .filter((e) => e.data.status === 'published')
    .sort((a, b) => catalogNumber(b.id) - catalogNumber(a.id));
}

export function paginate<T>(list: T[], size = PAGE_SIZE): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < list.length; i += size) pages.push(list.slice(i, i + size));
  return pages;
}

/** The index page an exhibit appears on, so "Back to the gallery" returns to it (R5). */
export function indexPageFor(number: number, ordered: ExhibitLike[], size = PAGE_SIZE): number {
  const position = ordered.findIndex((e) => catalogNumber(e.id) === number);
  return position < 0 ? 1 : Math.floor(position / size) + 1;
}

export function indexPath(page: number): string {
  return page <= 1 ? '/' : `/page/${page}/`;
}

/** Narrows an entry to the published variant (the only one with a resolved image). */
export function isPublished<T extends { data: { status: ExhibitStatus } }>(
  entry: T,
): entry is T & { data: Extract<T['data'], { status: 'published' }> } {
  return entry.data.status === 'published';
}
