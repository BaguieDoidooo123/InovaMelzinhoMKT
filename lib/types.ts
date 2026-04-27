export type Platform = "instagram" | "facebook";

export type PostStatus = "draft" | "approved" | "scheduled" | "published" | "failed";

export type GeneratedPost = {
  titulo: string;
  legenda: string;
  tipoPost: string;
  promptVisual: string;
  sugestaoDataHorario: string;
  hashtags: string[];
  imagemUrl: string;
};

export type ScheduledPost = {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  suggested_schedule: string;
  scheduled_at: string;
  visual_prompt: string;
  image_url: string;
  status: PostStatus;
  platforms: Platform[];
  created_at: string;
};

export type MetaConnectionInput = {
  facebookPageId?: string;
  instagramBusinessAccountId?: string;
  accessToken: string;
  tokenExpiresAt?: string;
};
