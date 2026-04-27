import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { buildImageUrl } from "@/lib/image";
import { GeneratedPost } from "@/lib/types";

type GeneratedPostWithoutImage = Omit<GeneratedPost, "imagemUrl">;

const model = "gemini-2.0-flash-001";

const schema = {
  type: "object",
  properties: {
    titulo: { type: "string" },
    legenda: { type: "string" },
    tipoPost: { type: "string" },
    promptVisual: { type: "string" },
    sugestaoDataHorario: { type: "string" },
    hashtags: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "titulo",
    "legenda",
    "tipoPost",
    "promptVisual",
    "sugestaoDataHorario",
    "hashtags",
  ],
} as const;

function isValidPost(data: unknown): data is GeneratedPostWithoutImage {
  if (!data || typeof data !== "object") return false;
  const post = data as Partial<GeneratedPostWithoutImage>;

  return (
    typeof post.titulo === "string" &&
    typeof post.legenda === "string" &&
    typeof post.tipoPost === "string" &&
    typeof post.promptVisual === "string" &&
    typeof post.sugestaoDataHorario === "string" &&
    Array.isArray(post.hashtags) &&
    post.hashtags.every((tag) => typeof tag === "string")
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada." }, { status: 500 });
  }

  try {
    const body = (await request.json()) as {
      instruction?: string;
      currentPost?: GeneratedPost;
    };

    const instruction = body.instruction?.trim();
    const currentPost = body.currentPost;

    if (!instruction || !currentPost) {
      return NextResponse.json(
        { error: "Envie uma instrução e a postagem atual para refinamento." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction =
      "Você é um estrategista de conteúdo e diretor de arte. Receba instruções curtas e refine a postagem existente mantendo contexto.";

    const prompt = `Post atual: ${JSON.stringify({
      titulo: currentPost.titulo,
      legenda: currentPost.legenda,
      tipoPost: currentPost.tipoPost,
      promptVisual: currentPost.promptVisual,
      sugestaoDataHorario: currentPost.sugestaoDataHorario,
      hashtags: currentPost.hashtags,
    })}\n\nInstrução do usuário: ${instruction}\n\nRetorne somente JSON válido seguindo o schema.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json({ error: "A IA não retornou conteúdo." }, { status: 502 });
    }

    const parsed = JSON.parse(text) as unknown;

    if (!isValidPost(parsed)) {
      return NextResponse.json({ error: "Resposta em formato inesperado." }, { status: 502 });
    }

    return NextResponse.json({
      ...parsed,
      imagemUrl: buildImageUrl(parsed.promptVisual),
    } satisfies GeneratedPost);
  } catch (error) {
    console.error("Erro no refinamento:", error);
    return NextResponse.json({ error: "Não foi possível refinar a postagem." }, { status: 500 });
  }
}
