import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabasePatch, supabaseSelect } from "@/lib/supabase-rest";
import { Platform, ScheduledPost } from "@/lib/types";

type MetaConnection = {
  id: string;
  facebook_page_id: string | null;
  instagram_business_account_id: string | null;
  access_token: string;
};

type Context = {
  params: {
    id: string;
  };
};

async function publishFacebook(post: ScheduledPost, connection: MetaConnection) {
  if (!connection.facebook_page_id) {
    throw new Error("Facebook Page ID não configurado.");
  }

  const response = await fetch(
    `https://graph.facebook.com/v22.0/${connection.facebook_page_id}/photos`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        caption: `${post.caption}\n\n${post.hashtags.join(" ")}`,
        url: post.image_url,
        access_token: connection.access_token,
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha Facebook: ${text}`);
  }
}

async function publishInstagram(post: ScheduledPost, connection: MetaConnection) {
  if (!connection.instagram_business_account_id) {
    throw new Error("Instagram Business Account ID não configurado.");
  }

  const createContainerResponse = await fetch(
    `https://graph.facebook.com/v22.0/${connection.instagram_business_account_id}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        image_url: post.image_url,
        caption: `${post.caption}\n\n${post.hashtags.join(" ")}`,
        access_token: connection.access_token,
      }),
    },
  );

  if (!createContainerResponse.ok) {
    const text = await createContainerResponse.text();
    throw new Error(`Falha ao criar mídia no Instagram: ${text}`);
  }

  const container = (await createContainerResponse.json()) as { id: string };

  const publishResponse = await fetch(
    `https://graph.facebook.com/v22.0/${connection.instagram_business_account_id}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        creation_id: container.id,
        access_token: connection.access_token,
      }),
    },
  );

  if (!publishResponse.ok) {
    const text = await publishResponse.text();
    throw new Error(`Falha ao publicar no Instagram: ${text}`);
  }
}

export async function POST(_: Request, { params }: Context) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase não configurado para publicar." },
      { status: 412 },
    );
  }

  try {
    const [post] = await supabaseSelect<ScheduledPost[]>(
      "scheduled_posts",
      `select=*&id=eq.${params.id}&limit=1`,
    );

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado." }, { status: 404 });
    }

    const [connection] = await supabaseSelect<MetaConnection[]>(
      "meta_connections",
      "select=*&id=eq.default&limit=1",
    );

    if (!connection) {
      return NextResponse.json(
        { error: "Conecte uma conta Meta antes de publicar." },
        { status: 400 },
      );
    }

    const platforms = post.platforms as Platform[];

    if (platforms.includes("facebook")) {
      await publishFacebook(post, connection);
    }

    if (platforms.includes("instagram")) {
      await publishInstagram(post, connection);
    }

    const [updated] = await supabasePatch<ScheduledPost[]>(
      "scheduled_posts",
      `id=eq.${post.id}`,
      { status: "published" },
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao publicar agora:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Falha na publicação." },
      { status: 500 },
    );
  }
}
