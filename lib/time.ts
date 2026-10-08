/** Relógio isolado: páginas de servidor leem a hora aqui (a regra de pureza do React não aceita Date.now() no render). */
export const nowMs = (): number => Date.now();
export const daysAgoISO = (n: number): string => new Date(nowMs() - n * 86_400_000).toISOString();
export const ageMs = (iso: string): number => nowMs() - new Date(iso).getTime();
export const isWithinDays = (iso: string, n: number): boolean => ageMs(iso) < n * 86_400_000;
