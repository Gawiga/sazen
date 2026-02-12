import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'https://gawiga-server.bonito-dace.ts.net/';

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  if (token) pb.authStore.save(token, {});
  return pb;
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const token = cookies.get('pb_auth')?.value;
    const pb = getPb(token);
    const fatur = await pb.collection('faturamento_mensal').getFullList({});
    const receber = await pb.collection('valores_receber').getFullList({});
    return new Response(JSON.stringify({ success: true, fatur, receber }), { status: 200 });
  } catch (err) {
    console.error('reports GET error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
};
