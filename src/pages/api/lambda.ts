import type { APIRoute } from 'astro';

const URL_AWS = 'https://nl47cekplgwzoaw4lh4zgcu6se0cozer.lambda-url.us-east-2.on.aws/frases';

export const GET: APIRoute = async () => {
  try {
    const response = await fetch(URL_AWS);
    const data = await response.text();
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const response = await fetch(URL_AWS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseData = await response.text();
    return new Response(responseData, { status: response.ok ? 200 : response.status });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const response = await fetch(URL_AWS, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const responseData = await response.text();
    return new Response(responseData, { status: response.ok ? 200 : response.status });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
