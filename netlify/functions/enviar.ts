// netlify/functions/api.ts
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    const urlPost = 'https://nl47cekplgwzoaw4lh4zgcu6se0cozer.lambda-url.us-east-2.on.aws/frases';
    const urlGet = 'https://nl47cekplgwzoaw4lh4zgcu6se0cozer.lambda-url.us-east-2.on.aws/frases2';

    // --- LÓGICA PARA O GET ---
    if (req.method === "GET") {
        try {
            const response = await fetch(urlGet);
            const data = await response.json();
            return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: "Erro ao buscar dados" }), { status: 500 });
        }
    }

    // --- LÓGICA PARA O POST ---
    if (req.method === "POST") {
        try {
            const body = await req.json();
            const response = await fetch(urlPost, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await response.text();
            return new Response(JSON.stringify({ message: data }), {
                status: response.ok ? 200 : 400,
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    return new Response("Método não permitido", { status: 405 });
};