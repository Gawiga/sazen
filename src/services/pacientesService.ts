/* eslint-disable @typescript-eslint/no-explicit-any */
import PocketBase from "pocketbase";
import { decodeJwt, getTokenFromRequest } from "../lib/jwt-helper";

const POCKETBASE_URL =
  import.meta.env.PUBLIC_POCKETBASE_URL ||
  "https://gawiga-server.bonito-dace.ts.net/";

function getPb(token?: string) {
  const pb = new PocketBase(POCKETBASE_URL);
  
  if (token) pb.authStore.save(token, {} as any);
  return pb;
}

function getTokenOrUnauthorized(
  request: Request,
  cookies: any,
): { token?: string; response?: Response } {
  const token = getTokenFromRequest(request, cookies);
  if (!token) {
    return {
      response: new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      ),
    };
  }

  return { token };
}

function getOwnerIdFromToken(token: string): string | null {
  const decoded = decodeJwt(token);
  if (!decoded.valid) return null;

  const userId = decoded.payload.id;
  return typeof userId === "string" && userId.length > 0 ? userId : null;
}


export async function listPacientes(
  request: Request,
  cookies: any,
): Promise<Response> {
  try {
    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const pb = getPb(auth.token);
    const list = await pb
      .collection("paciente")
      .getFullList({ sort: "-created" });
    return new Response(JSON.stringify({ success: true, items: list }), {
      status: 200,
    });
  } catch (err) {
    console.error("pacientes GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 },
    );
  }
}


export async function createPaciente(
  request: Request,
  cookies: any,
): Promise<Response> {
  try {
    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const { token } = auth;
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401 },
      );
    }

    const pb = getPb(token);
    const payload = await request.json();
    const owner = getOwnerIdFromToken(token);
    if (owner) payload.owner = owner;

    const record = await pb.collection("paciente").create(payload);
    return new Response(JSON.stringify({ success: true, record }), {
      status: 201,
    });
  } catch (err) {
    console.error("pacientes POST error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}


export async function getPacienteById(
  id: string | undefined,
  request: Request,
  cookies: any,
): Promise<Response> {
  try {
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid ID" }),
        { status: 400 },
      );
    }

    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const pb = getPb(auth.token);
    const record = await pb.collection("paciente").getOne(id);
    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
    });
  } catch (err) {
    console.error("paciente GET error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 404 },
    );
  }
}


export async function updatePaciente(
  id: string | undefined,
  request: Request,
  cookies: any,
): Promise<Response> {
  try {
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid ID" }),
        { status: 400 },
      );
    }

    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const payload = await request.json();
    const pb = getPb(auth.token);
    const record = await pb.collection("paciente").update(id, payload);

    return new Response(JSON.stringify({ success: true, record }), {
      status: 200,
    });
  } catch (err) {
    console.error("paciente PUT error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}


export async function deletePaciente(
  id: string | undefined,
  request: Request,
  cookies: any,
): Promise<Response> {
  try {
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid ID" }),
        { status: 400 },
      );
    }

    const auth = getTokenOrUnauthorized(request, cookies);
    if (auth.response) return auth.response;

    const pb = getPb(auth.token);
    await pb.collection("paciente").delete(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("paciente DELETE error", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 400 },
    );
  }
}

export const pacientesService = {
  listPacientes,
  createPaciente,
  getPacienteById,
  updatePaciente,
  deletePaciente,
};
