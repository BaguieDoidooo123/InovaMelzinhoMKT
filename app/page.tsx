"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileEdit,
  Flame,
  Image,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
} from "lucide-react";
import { GeneratedPost, Platform, ScheduledPost } from "@/lib/types";

type PostResponseError = { error: string };

const draftStorageKey = "generated-post-draft";
const fallbackScheduledStorageKey = "scheduled-posts-fallback";

function parseBrazilDateToIso(dateText: string) {
  const match = dateText.match(/(\d{2})\/(\d{2})\/(\d{4})\s+às\s+(\d{2}):(\d{2})/i);

  if (!match) {
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  const [, day, month, year, hour, minute] = match;
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`).toISOString();
}

function toDatetimeLocalValue(isoDate: string) {
  const date = new Date(isoDate);
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatDateLabel(dateIso: string) {
  const date = new Date(dateIso);

  return {
    date: date.toLocaleDateString("pt-BR", { day: "2-digit" }),
    day: date.toLocaleDateString("pt-BR", { weekday: "long" }),
    month: date.toLocaleDateString("pt-BR", { month: "long" }),
  };
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram"]);
  const [selectedScheduleAt, setSelectedScheduleAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishingId, setIsPublishingId] = useState<string | null>(null);
  const [isConnectingMeta, setIsConnectingMeta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metaConnectionForm, setMetaConnectionForm] = useState({
    accessToken: "",
    facebookPageId: "",
    instagramBusinessAccountId: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem(draftStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as GeneratedPost;
      setGeneratedPost(parsed);
      setSelectedScheduleAt(toDatetimeLocalValue(parseBrazilDateToIso(parsed.sugestaoDataHorario)));
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }, []);

  useEffect(() => {
    const fetchScheduledPosts = async () => {
      try {
        const response = await fetch("/api/scheduled-posts");
        const data = (await response.json()) as ScheduledPost[] | PostResponseError;

        if (!response.ok) {
          const fallback = localStorage.getItem(fallbackScheduledStorageKey);
          if (fallback) {
            setScheduledPosts(JSON.parse(fallback) as ScheduledPost[]);
          }
          return;
        }

        setScheduledPosts(data as ScheduledPost[]);
      } catch {
        const fallback = localStorage.getItem(fallbackScheduledStorageKey);
        if (fallback) {
          setScheduledPosts(JSON.parse(fallback) as ScheduledPost[]);
        }
      }
    };

    void fetchScheduledPosts();
  }, []);

  const totalPublished = useMemo(
    () => scheduledPosts.filter((post) => post.status === "published").length,
    [scheduledPosts],
  );

  const totalScheduled = useMemo(
    () => scheduledPosts.filter((post) => post.status === "scheduled").length,
    [scheduledPosts],
  );

  const applyGeneratedPost = (data: GeneratedPost) => {
    setGeneratedPost(data);
    setSelectedScheduleAt(toDatetimeLocalValue(parseBrazilDateToIso(data.sugestaoDataHorario)));
    localStorage.setItem(draftStorageKey, JSON.stringify(data));
  };

  const handleGeneratePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setError("Digite um pedido para criar ou ajustar a postagem.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const endpoint = generatedPost ? "/api/refine-post" : "/api/generate-post";
    const payload = generatedPost
      ? { instruction: prompt, currentPost: generatedPost }
      : { prompt };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as GeneratedPost | PostResponseError;

      if (!response.ok) {
        setError("error" in data ? data.error : "Não foi possível gerar a sugestão neste momento.");
        return;
      }

      applyGeneratedPost(data as GeneratedPost);
      setPrompt("");
    } catch {
      setError("Falha de conexão ao gerar/refinar a sugestão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleQuickCaptionRegeneration = async () => {
    if (!generatedPost) return;

    setPrompt("Reescreva só a legenda, mantendo estrutura, hashtags e horário.");

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/refine-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: "Reescreva só a legenda, mantendo estrutura, hashtags e horário.",
          currentPost: generatedPost,
        }),
      });

      const data = (await response.json()) as GeneratedPost | PostResponseError;

      if (!response.ok) {
        setError("error" in data ? data.error : "Não foi possível regenerar legenda.");
        return;
      }

      applyGeneratedPost(data as GeneratedPost);
      setPrompt("");
    } catch {
      setError("Falha ao regenerar legenda.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegenerateImage = async () => {
    if (!generatedPost) return;

    setIsImageLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptVisual: generatedPost.promptVisual }),
      });

      const data = (await response.json()) as { imageUrl: string } | PostResponseError;

      if (!response.ok || !("imageUrl" in data)) {
        setError("error" in data ? data.error : "Não foi possível regenerar arte.");
        return;
      }

      applyGeneratedPost({ ...generatedPost, imagemUrl: data.imageUrl });
    } catch {
      setError("Falha ao regenerar arte.");
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleApproveAndSchedule = async () => {
    if (!generatedPost) return;

    setIsSaving(true);
    setError(null);

    const scheduleIso = selectedScheduleAt
      ? new Date(selectedScheduleAt).toISOString()
      : parseBrazilDateToIso(generatedPost.sugestaoDataHorario);

    const payload = {
      title: generatedPost.titulo,
      caption: generatedPost.legenda,
      hashtags: generatedPost.hashtags,
      suggestedSchedule: generatedPost.sugestaoDataHorario,
      scheduledAt: scheduleIso,
      visualPrompt: generatedPost.promptVisual,
      imageUrl: generatedPost.imagemUrl,
      platforms,
    };

    try {
      const response = await fetch("/api/scheduled-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as ScheduledPost | PostResponseError;

      if (!response.ok) {
        const fallbackPost: ScheduledPost = {
          id: crypto.randomUUID(),
          title: payload.title,
          caption: payload.caption,
          hashtags: payload.hashtags,
          suggested_schedule: payload.suggestedSchedule,
          scheduled_at: payload.scheduledAt,
          visual_prompt: payload.visualPrompt,
          image_url: payload.imageUrl,
          status: "scheduled",
          platforms: payload.platforms,
          created_at: new Date().toISOString(),
        };

        const fallbackPosts = [fallbackPost, ...scheduledPosts];
        setScheduledPosts(fallbackPosts);
        localStorage.setItem(fallbackScheduledStorageKey, JSON.stringify(fallbackPosts));
        setError(
          "Supabase não configurado. Salvei em localStorage apenas para teste local. Configure Supabase para persistência real.",
        );
        return;
      }

      setScheduledPosts((prev) => [data as ScheduledPost, ...prev]);
      localStorage.removeItem(draftStorageKey);
      setGeneratedPost(null);
      setSelectedScheduleAt("");
    } catch {
      setError("Falha ao agendar post.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishNow = async (postId: string) => {
    setIsPublishingId(postId);
    setError(null);

    try {
      const response = await fetch(`/api/scheduled-posts/${postId}/publish-now`, {
        method: "POST",
      });

      const data = (await response.json()) as ScheduledPost | PostResponseError;

      if (!response.ok) {
        setError("error" in data ? data.error : "Falha na publicação manual.");
        return;
      }

      setScheduledPosts((prev) => prev.map((post) => (post.id === postId ? (data as ScheduledPost) : post)));
    } catch {
      setError("Falha de conexão ao publicar agora.");
    } finally {
      setIsPublishingId(null);
    }
  };

  const handleMetaConnect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsConnectingMeta(true);
    setError(null);

    try {
      const response = await fetch("/api/meta/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaConnectionForm),
      });

      const data = (await response.json()) as { id: string } | PostResponseError;

      if (!response.ok) {
        setError("error" in data ? data.error : "Falha ao conectar Meta.");
        return;
      }

      setMetaConnectionForm({ accessToken: "", facebookPageId: "", instagramBusinessAccountId: "" });
    } catch {
      setError("Falha de conexão ao salvar Meta.");
    } finally {
      setIsConnectingMeta(false);
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
              placeholder={
                generatedPost
                  ? "Ex: move a garrafa de cachaça para a esquerda"
                  : "O que vamos criar hoje para sua marca?"
              }
            />
            <button className="sendBtn" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 size={15} className="spinIcon" /> : <Send size={15} />}
              <span>{generatedPost ? "Refinar post" : "Gerar Post + Arte"}</span>
            </button>
          </form>

          {error ? <p className="generationError">{error}</p> : null}

          {isLoading ? <section className="generatedCard morphingCard" aria-hidden="true" /> : null}

          {generatedPost ? (
            <section className="generatedCard morphIn" aria-live="polite">
              <div className="generatedCardHeader">
                <h2>
                  <Sparkles size={18} />
                  Sugestão gerada com IA
                </h2>
                <span>Preview</span>
              </div>

              <img
                src={generatedPost.imagemUrl}
                alt={generatedPost.titulo}
                className="generatedImage"
                loading="lazy"
              />

              <h3>{generatedPost.titulo}</h3>
              <p>{generatedPost.legenda}</p>

              <div className="generatedMeta singleColumn">
                <div>
                  <strong>Horário do post</strong>
                  <input
                    type="datetime-local"
                    value={selectedScheduleAt}
                    onChange={(event) => setSelectedScheduleAt(event.target.value)}
                  />
                </div>
              </div>

              <div className="generatedTags">
                {generatedPost.hashtags.map((hashtag) => (
                  <span key={hashtag}>{hashtag}</span>
                ))}
              </div>

              <div className="platformSelector">
                <label>
                  <input
                    type="checkbox"
                    checked={platforms.includes("instagram")}
                    onChange={(event) => {
                      setPlatforms((prev) => {
                        if (event.target.checked) return Array.from(new Set([...prev, "instagram"]));
                        return prev.filter((platform) => platform !== "instagram");
                      });
                    }}
                  />
                  Instagram
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={platforms.includes("facebook")}
                    onChange={(event) => {
                      setPlatforms((prev) => {
                        if (event.target.checked) return Array.from(new Set([...prev, "facebook"]));
                        return prev.filter((platform) => platform !== "facebook");
                      });
                    }}
                  />
                  Facebook
                </label>
              </div>

              <div className="generatedActions">
                <button type="button" onClick={handleRegenerateImage} disabled={isImageLoading}>
                  {isImageLoading ? "Gerando..." : "Regenerar arte"}
                </button>
                <button type="button" onClick={handleQuickCaptionRegeneration} disabled={isLoading}>
                  Regenerar legenda
                </button>
                <button type="button" onClick={handleApproveAndSchedule} disabled={isSaving}>
                  {isSaving ? "Agendando..." : "Aprovar e agendar"}
                </button>
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
            {scheduledPosts.map((item) => {
              const calendarDate = formatDateLabel(item.scheduled_at);

              return (
                <article key={item.id} className="planCard">
                  <div className="planTop">
                    <div className="dateBadge">{calendarDate.date}</div>

                    <div>
                      <span className="dayName">{calendarDate.day}</span>
                      <span className="monthName">{calendarDate.month}</span>
                    </div>

                    <button className="moreButton" aria-label="Mais opções">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <span className="chip">
                    <Image size={13} />
                    {item.platforms.join(" + ")}
                  </span>

                  <h2>{item.title}</h2>
                  <p>{item.caption}</p>

                  <footer>
                    <span className="statusDot" />
                    {item.status}
                  </footer>

                  <div className="cardActions">
                    <a href={item.image_url} target="_blank" rel="noreferrer">
                      <ExternalLink size={13} /> Ver arte
                    </a>
                    {item.status !== "published" ? (
                      <button
                        type="button"
                        onClick={() => handlePublishNow(item.id)}
                        disabled={isPublishingId === item.id}
                      >
                        {isPublishingId === item.id ? "Publicando..." : "Publicar agora"}
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
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
              <strong>{totalScheduled}</strong>
              <span>Conteúdos agendados</span>
            </div>

            <div>
              <FileEdit size={17} />
              <strong>{Math.max(scheduledPosts.length - totalPublished, 0)}</strong>
              <span>Em rascunho/agendado</span>
            </div>

            <div>
              <CheckCircle2 size={17} />
              <strong>{totalPublished}</strong>
              <span>Publicados</span>
            </div>
          </div>
        </section>

        <section className="card eventCard">
          <h2>Conexão Meta</h2>
          <form className="metaForm" onSubmit={handleMetaConnect}>
            <input
              placeholder="Access Token"
              value={metaConnectionForm.accessToken}
              onChange={(event) =>
                setMetaConnectionForm((prev) => ({ ...prev, accessToken: event.target.value }))
              }
            />
            <input
              placeholder="Facebook Page ID"
              value={metaConnectionForm.facebookPageId}
              onChange={(event) =>
                setMetaConnectionForm((prev) => ({ ...prev, facebookPageId: event.target.value }))
              }
            />
            <input
              placeholder="Instagram Business Account ID"
              value={metaConnectionForm.instagramBusinessAccountId}
              onChange={(event) =>
                setMetaConnectionForm((prev) => ({ ...prev, instagramBusinessAccountId: event.target.value }))
              }
            />
            <button type="submit" disabled={isConnectingMeta}>
              {isConnectingMeta ? "Salvando..." : "Conectar Meta"}
            </button>
          </form>
        </section>

        <section className="aiTipCard">
          <h2>
            <Sparkles size={18} />
            Dica da IA
          </h2>

          <p>“Com o post aberto, mande ajustes curtos no campo principal para refinar arte e legenda.”</p>
        </section>

        <section className="notificationCard">
          <MessageCircle size={16} />
          Fluxo completo: gerar, refinar, aprovar, agendar e publicar manualmente.
        </section>

        <section className="eventItem" style={{ marginTop: 12 }}>
          <div className="eventIcon">
            <Flame size={19} />
          </div>
          <div>
            <strong>Fallback de Teste</strong>
            <p>Sem Supabase, o app salva agendamentos em localStorage só para validação local.</p>
          </div>
        </section>
      </aside>
    </main>
  );
}
