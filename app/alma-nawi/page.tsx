import type { Metadata } from 'next';
import { Quiz } from '@/components/quiz/Quiz';
import { parseAnswers } from '@/domain/recommendations/options';

export const metadata: Metadata = {
  title: 'Alma Nawi: encuentra tu viaje',
  description: 'Responde seis preguntas y Alma Nawi te recomienda experiencias que combinan con tu momento, tu tiempo y tu presupuesto.',
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const initial = parseAnswers(await searchParams) ?? undefined;
  return (
    <main id="contenido">
      <Quiz initial={initial} />
    </main>
  );
}
