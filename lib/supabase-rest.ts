const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

function getHeaders() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase não configurado.");
  }

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function supabaseSelect<T>(table: string, query: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase select falhou (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function supabaseInsert<T>(table: string, payload: object) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Supabase insert falhou (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function supabaseUpsert<T>(table: string, payload: object, onConflict: string) {
  const headers = {
    ...getHeaders(),
    Prefer: "resolution=merge-duplicates,return=representation",
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Supabase upsert falhou (${response.status})`);
  }

  return (await response.json()) as T;
}

export async function supabasePatch<T>(table: string, query: string, payload: object) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Supabase patch falhou (${response.status})`);
  }

  return (await response.json()) as T;
}
