"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileEdit,
  Flame,
  Image,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
} from "lucide-react";

type GeneratedPost = {
  titulo: string;
  legenda: string;
  tipoPost: string;
  promptVisual: string;
  sugestaoDataHorario: string;
  hashtags: string[];
};

const planningItems = [
  {
    date: "27",
    day: "Segunda-feira",
    month: "Abril",
    type: "Carrossel",
    title: "Dicas para aumentar o engajamento",
    description: "Postagem com 5 slides sobre boas práticas para redes sociais.",
    status: "Planejado",
  },
  {
    date: "29",
    day: "Quarta-feira",
    month: "Abril",
    type: "Imagem",
    title: "Benefícios do Marketing",
    description: "Arte institucional mostrando o valor da estratégia digital.",
    status: "Planejado",
  },
  {
    date: "21",
    day: "Dia 21",
    month: "Abril",
    type: "Imagem",
    title: "Promoção Melzinho 2x1",
    description: "Post promocional para campanha compre 1 leve 2.",
    status: "Planejado",
  },
];

const storageKey = "generated-post-suggestion";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as GeneratedPost;
      setGeneratedPost(parsed);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  const handleGeneratePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setError("Digite um tema para gerar a sugestão de post.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = (await response.json()) as GeneratedPost | { error: string };

      if (!response.ok) {
        setError(
          "error" in data
            ? data.error
            : "Não foi possível gerar a sugestão neste momento.",
        );
        return;
      }

      setGeneratedPost(data as GeneratedPost);
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      setError("Falha de conexão ao gerar a sugestão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="content">
        <header className="topArea">
          <span className="eyebrow">Assistente Virtual</span>

          <form className="chatBar" onSubmit={handleGeneratePost}>
            <input
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="O que vamos criar hoje para sua marca?"
            />
            <button className="sendBtn" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 size={15} className="spinIcon" /> : <Send size={15} />}
              <span>Gerar Arte</span>
            </button>
          </form>

          {error ? <p className="generationError">{error}</p> : null}

          {generatedPost ? (
            <section className="generatedCard" aria-live="polite">
              <div className="generatedCardHeader">
                <h2>
                  <Sparkles size={18} />
                  Sugestão gerada com IA
                </h2>
                <span>{generatedPost.tipoPost}</span>
              </div>

              <h3>{generatedPost.titulo}</h3>
              <p>{generatedPost.legenda}</p>

              <div className="generatedMeta">
                <div>
                  <strong>Prompt visual</strong>
                  <span>{generatedPost.promptVisual}</span>
                </div>

                <div>
                  <strong>Melhor horário</strong>
                  <span>{generatedPost.sugestaoDataHorario}</span>
                </div>
              </div>

              <div className="generatedTags">
                {generatedPost.hashtags.map((hashtag) => (
                  <span key={hashtag}>{hashtag}</span>
                ))}
              </div>
            </section>
          ) : null}
        </header>

        <section className="planner">
          <div className="plannerHeader">
            <div>
              <h1>Calendário da Semana</h1>
              <p>Aqui está o seu plano de conteúdo estratégico.</p>
            </div>

            <div className="calendarControls">
              <button className="weekSelector">
                <CalendarDays size={15} />
                Esta semana
              </button>

              <div className="monthSelector">
                <span>Abril 2026</span>
                <button>
                  <ChevronLeft size={16} />
                </button>
                <button>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid">
            {planningItems.map((item) => (
              <article key={`${item.date}-${item.title}`} className="planCard">
                <div className="planTop">
                  <div className="dateBadge">{item.date}</div>

                  <div>
                    <span className="dayName">{item.day}</span>
                    <span className="monthName">{item.month}</span>
                  </div>

                  <button className="moreButton" aria-label="Mais opções">
                    <MoreHorizontal size={18} />
                  </button>
                </div>

                <span className="chip">
                  <Image size={13} />
                  {item.type}
                </span>

                <h2>{item.title}</h2>
                <p>{item.description}</p>

                <footer>
                  <span className="statusDot" />
                  {item.status}
                </footer>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="rightPanel">
        <section className="card summary">
          <h2>Análise de Performance</h2>

          <div className="chartBox">
            <div className="chartTop">
              <span>Alcance Semanal</span>
              <strong>+14%</strong>
            </div>
            <div className="chartLine" />
          </div>

          <div className="summaryList">
            <div>
              <CalendarDays size={17} />
              <strong>3</strong>
              <span>Conteúdos planejados</span>
            </div>

            <div>
              <FileEdit size={17} />
              <strong>1</strong>
              <span>Em rascunho</span>
            </div>

            <div>
              <CheckCircle2 size={17} />
              <strong>0</strong>
              <span>Publicados</span>
            </div>
          </div>
        </section>

        <section className="card eventCard">
          <h2>Eventos Sugeridos</h2>

          <div className="eventItem">
            <div className="eventIcon">
              <Flame size={19} />
            </div>

            <div>
              <strong>Black Friday</strong>
              <p>Faltam 12 dias. Prepare seu carrossel de ofertas agora!</p>
            </div>
          </div>
        </section>

        <section className="aiTipCard">
          <h2>
            <Sparkles size={18} />
            Dica da IA
          </h2>

          <p>“Posts com fotos de bastidores performam melhor às terças-feiras.”</p>
        </section>

        <section className="notificationCard">
          <MessageCircle size={16} />
          Novo comentário no Instagram
        </section>
      </aside>
    </main>
  );
}
