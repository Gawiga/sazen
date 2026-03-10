import type { APIRoute } from "astro";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";
const HEALTHCHECK_TIMEOUT_MS = 3000;

function getHealthEndpoint(baseUrl: string): string {
  try {
    return new URL("/api/health", baseUrl).toString();
  } catch {
    return `${baseUrl.replace(/\/$/, "")}/api/health`;
  }
}

export const GET: APIRoute = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    HEALTHCHECK_TIMEOUT_MS,
  );

  try {
    const response = await fetch(getHealthEndpoint(POCKETBASE_URL), {
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.warn(
        `[health] PocketBase indisponível: ${POCKETBASE_URL} (status ${response.status})`,
      );
      return new Response(
        JSON.stringify({
          online: false,
          server: POCKETBASE_URL,
          status: response.status,
        }),
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return new Response(
      JSON.stringify({
        online: true,
        server: POCKETBASE_URL,
      }),
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.warn(
      `[health] Falha ao verificar PocketBase em ${POCKETBASE_URL}:`,
      error,
    );
    return new Response(
      JSON.stringify({
        online: false,
        server: POCKETBASE_URL,
        error: error instanceof Error ? error.message : "Server unavailable",
      }),
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } finally {
    clearTimeout(timeoutId);
  }
};
