import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Receptor de webhooks de gateways. AINDA NÃO PROCESSA PAGAMENTOS: responde 501 até que o adaptador
 * do provedor (verificação de assinatura + conciliação com `payments`) seja implementado e as chaves
 * do servidor estejam configuradas. Nunca confirmar pagamento sem verificar a assinatura do provedor.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  if (!['stripe', 'mercadopago', 'paypal'].includes(provider)) return NextResponse.json({ error: 'unknown_provider' }, { status: 404 });
  return NextResponse.json({ error: 'not_implemented', provider }, { status: 501 });
}
