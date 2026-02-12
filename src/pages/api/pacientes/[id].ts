import type { APIRoute } from 'astro';
import PocketBase from 'pocketbase';
import { getTokenFromRequest } from '../../../lib/jwt-helper';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'https://gawiga-server.bonito-dace.ts.net/';

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (token) pb.authStore.save(token, {} as any);
  return pb;
}

export const GET: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id as string;
    if (!id) return new Response(JSON.stringify({ success: false, error: 'Invalid ID' }), { status: 400 });
    const token = getTokenFromRequest(request, cookies);
    if (!token) return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    const pb = getPb(token);
    const record = await pb.collection('paciente').getOne(id);
    return new Response(JSON.stringify({ success: true, record }), { status: 200 });
  } catch (err) {
    console.error('paciente GET error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 404 });
  }
};

export const PUT: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id as string;
    if (!id) return new Response(JSON.stringify({ success: false, error: 'Invalid ID' }), { status: 400 });
    const payload = await request.json();
    const token = getTokenFromRequest(request, cookies);
    if (!token) return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    const pb = getPb(token);
    const record = await pb.collection('paciente').update(id, payload);
    return new Response(JSON.stringify({ success: true, record }), { status: 200 });
  } catch (err) {
    console.error('paciente PUT error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 400 });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const id = params.id as string;
    if (!id) return new Response(JSON.stringify({ success: false, error: 'Invalid ID' }), { status: 400 });
    const token = getTokenFromRequest(request, cookies);
    if (!token) return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    const pb = getPb(token);
    await pb.collection('paciente').delete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('paciente DELETE error', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 400 });
  }
};
