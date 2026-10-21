import { describeSite } from "../_lib/site.js";
import { jsonWithCors, corsHeaders } from "../_lib/cors.js";

export async function onRequestGet({ env }) {
  return jsonWithCors(describeSite(env));
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
