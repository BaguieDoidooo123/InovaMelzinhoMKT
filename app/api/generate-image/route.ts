import { NextResponse } from "next/server";
import { buildImageUrl } from "@/lib/image";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { promptVisual?: string };
    const promptVisual = body.promptVisual?.trim();

    if (!promptVisual) {
      return NextResponse.json({ error: "Informe um prompt visual." }, { status: 400 });
    }

    return NextResponse.json({ imageUrl: buildImageUrl(promptVisual) });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível regenerar a arte agora." },
      { status: 500 },
    );
  }
}
