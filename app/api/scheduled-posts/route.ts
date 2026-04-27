import { NextResponse } from "next/server";
import { Platform, ScheduledPost } from "@/lib/types";
import {
  isSupabaseConfigured,
  supabaseInsert,
  supabaseSelect,
} from "@/lib/supabase-rest";

function fallbackNotConfigured() {
  return NextResponse.json(
    {
      error:
        "Supabase não configurado no servidor. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para persistência real.",
    },
    { status: 412 },
  );
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return fallbackNotConfigured();
  }

  try {
    const rows = await supabaseSelect<ScheduledPost[]>(
      "scheduled_posts",
      "select=*&order=created_at.desc",
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erro ao listar posts:", error);
    return NextResponse.json({ error: "Falha ao listar posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return fallbackNotConfigured();
  }

  try {
    const body = (await request.json()) as {
      title?: string;
      caption?: string;
      hashtags?: string[];
      suggestedSchedule?: string;
      scheduledAt?: string;
      visualPrompt?: string;
      imageUrl?: string;
      platforms?: Platform[];
    };

    if (!body.title || !body.caption || !body.visualPrompt || !body.imageUrl || !body.scheduledAt) {
      return NextResponse.json({ error: "Payload inválido para agendamento." }, { status: 400 });
    }

    const [created] = await supabaseInsert<ScheduledPost[]>("scheduled_posts", {
      title: body.title,
      caption: body.caption,
      hashtags: body.hashtags ?? [],
      suggested_schedule: body.suggestedSchedule ?? body.scheduledAt,
      scheduled_at: body.scheduledAt,
      visual_prompt: body.visualPrompt,
      image_url: body.imageUrl,
      status: "scheduled",
      platforms: body.platforms && body.platforms.length ? body.platforms : ["instagram"],
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar post agendado:", error);
    return NextResponse.json({ error: "Falha ao salvar agendamento." }, { status: 500 });
  }
}
