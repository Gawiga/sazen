// src/pages/api/enviar.ts
export const POST = async ({ request }) => {
  try {
    const body = await request.json();

    // O servidor do Astro faz a chamada para a AWS (Aqui o CORS não existe)
    const response = await fetch('https://nl47cekplgwzoaw4lh4zgcu6se0cozer.lambda-url.us-east-2.on.aws/frases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.text();

    return new Response(JSON.stringify({ message: data }), {
      status: response.ok ? 200 : 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};
