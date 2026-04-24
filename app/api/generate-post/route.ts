import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

type GeneratedPost = {
  titulo: string;
  legenda: string;
  tipoPost: string;
  promptVisual: string;
  sugestaoDataHorario: string;
  hashtags: string[];
};

const generationModel = "gemini-2.0-flash-001";

const outputSchema = {
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

function isGeneratedPost(data: unknown): data is GeneratedPost {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const typedData = data as Partial<GeneratedPost>;

  return (
    typeof typedData.titulo === "string" &&
    typeof typedData.legenda === "string" &&
    typeof typedData.tipoPost === "string" &&
    typeof typedData.promptVisual === "string" &&
    typeof typedData.sugestaoDataHorario === "string" &&
    Array.isArray(typedData.hashtags) &&
    typedData.hashtags.every((hashtag) => typeof hashtag === "string")
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY não configurada. Defina a variável no ambiente do servidor.",
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Informe um texto para gerar a sugestão." },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction =
      "Você é um estrategista de conteúdo para redes sociais no Brasil. Responda em português do Brasil, com linguagem clara e persuasiva.";

    const userPrompt = `Com base no tema abaixo, gere uma sugestão de post para redes sociais.\n\nTema do usuário: ${prompt}\n\nRegras:\n- Retorne apenas JSON válido seguindo o schema solicitado.\n- Não use markdown.\n- Sugira uma data/horário realista no formato 'dd/mm/yyyy às HH:mm' considerando fuso de Brasília.\n- Liste entre 5 e 10 hashtags.`;

    const response = await ai.models.generateContent({
      model: generationModel,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: outputSchema,
      },
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        { error: "A IA não retornou conteúdo." },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(text) as unknown;

    if (!isGeneratedPost(parsed)) {
      return NextResponse.json(
        { error: "Resposta da IA em formato inesperado." },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Erro ao gerar post com Gemini:", error);

    return NextResponse.json(
      { error: "Não foi possível gerar o post no momento." },
      { status: 500 },
    );
  }
}
