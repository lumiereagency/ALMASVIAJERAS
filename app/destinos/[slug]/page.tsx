import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  redirect(`/experiencias/${(await params).slug}`);
}
