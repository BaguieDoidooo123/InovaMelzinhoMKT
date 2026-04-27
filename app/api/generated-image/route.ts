import { NextResponse } from "next/server";

function buildSvgFallback(prompt: string) {
  const safePrompt = prompt.replace(/[<>&"]/g, "").slice(0, 110);

  return `<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f6d7a8"/>
      <stop offset="100%" stop-color="#d58d2c"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="48" y="48" width="928" height="928" rx="36" fill="rgba(255,255,255,0.72)"/>
  <text x="512" y="490" text-anchor="middle" font-size="44" font-family="Inter, Arial" fill="#5d3719">Prévia de arte</text>
  <text x="512" y="560" text-anchor="middle" font-size="28" font-family="Inter, Arial" fill="#6f4a2e">${safePrompt}</text>
</svg>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get("prompt")?.trim();
  const seed = searchParams.get("seed")?.trim() ?? `${Date.now()}`;

  if (!prompt) {
    return NextResponse.json({ error: "Prompt ausente." }, { status: 400 });
  }

  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `${prompt}, social media ad, photorealistic, studio lighting`,
  )}?width=1024&height=1024&seed=${seed}&nologo=true`;

  try {
    const upstream = await fetch(pollinationsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/*",
      },
      cache: "no-store",
    });

    if (upstream.ok) {
      const imageBuffer = Buffer.from(await upstream.arrayBuffer());
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch (error) {
    console.error("Erro no proxy de imagem:", error);
  }

  const svg = buildSvgFallback(prompt);
  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
