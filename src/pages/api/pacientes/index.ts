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
    const list = await pb.collection('paciente').getFullList({ sort: '-created' });
    return new Response(JSON.stringify({ success: true, items: list }), { status: 200 });
  } catch (err) {
    console.error('pacientes GET error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('pb_auth')?.value;
    const pb = getPb(token);
    const payload = await request.json();
    const record = await pb.collection('paciente').create(payload);
    return new Response(JSON.stringify({ success: true, record }), { status: 201 });
  } catch (err) {
    console.error('pacientes POST error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 400 });
  }
};
