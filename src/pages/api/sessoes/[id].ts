import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'https://gawiga-server.bonito-dace.ts.net/';

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  if (token) pb.authStore.save(token, {});
  return pb;
}

export const GET: APIRoute = async ({ params, cookies }) => {
  try {
    const id = params.id;
    const token = cookies.get('pb_auth')?.value;
    const pb = getPb(token);
    const record = await pb.collection('sessao').getOne(id);
    return new Response(JSON.stringify({ success: true, record }), { status: 200 });
  } catch (err) {
    console.error('sessao GET error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 404 });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id;
    const payload = await request.json();
    const token = cookies.get('pb_auth')?.value;
    const pb = getPb(token);
    const record = await pb.collection('sessao').update(id, payload);
    return new Response(JSON.stringify({ success: true, record }), { status: 200 });
  } catch (err) {
    console.error('sessao PUT error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const id = params.id;
    const token = cookies.get('pb_auth')?.value;
    const pb = getPb(token);
    await pb.collection('sessao').delete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('sessao DELETE error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 400 });
  }
};
