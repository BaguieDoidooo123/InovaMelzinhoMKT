import { NextResponse } from "next/server";
import { MetaConnectionInput } from "@/lib/types";
import { isSupabaseConfigured, supabaseUpsert } from "@/lib/supabase-rest";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase não configurado para salvar conexão Meta." },
      { status: 412 },
    );
  }

  try {
    const body = (await request.json()) as MetaConnectionInput;

    if (!body.accessToken?.trim()) {
      return NextResponse.json({ error: "Access token é obrigatório." }, { status: 400 });
    }

    const [connection] = await supabaseUpsert<any[]>(
      "meta_connections",
      {
        id: "default",
        facebook_page_id: body.facebookPageId ?? null,
        instagram_business_account_id: body.instagramBusinessAccountId ?? null,
        access_token: body.accessToken,
        token_expires_at: body.tokenExpiresAt ?? null,
      },
      "id",
    );

    return NextResponse.json(connection);
  } catch (error) {
    console.error("Erro ao salvar conexão Meta:", error);
    return NextResponse.json({ error: "Não foi possível salvar conexão Meta." }, { status: 500 });
  }
}
