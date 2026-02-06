import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const URL_AWS = 'https://nl47cekplgwzoaw4lh4zgcu6se0cozer.lambda-url.us-east-2.on.aws/frases';
  const method = req.method;

  try {
    // --- GET ---
    if (method === "GET") {
      const response = await fetch(URL_AWS);
      const data = await response.text();
      return new Response(data, { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // --- POST e DELETE (Ambos agora enviam JSON Body) ---
    if (method === "POST" || method === "DELETE") {
      const body = await req.json();
      
      const response = await fetch(URL_AWS, {
        method: method, // Repassa o método original (POST ou DELETE)
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body), 
      });

      const responseData = await response.text();
      return new Response(responseData, { 
        status: response.ok ? 200 : response.status 
      });
    }

    return new Response("Método não permitido", { status: 405 });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};