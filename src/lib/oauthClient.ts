import {
  NodeOAuthClient,
  NodeSavedSession,
  NodeSavedState,
  buildAtprotoLoopbackClientMetadata,
} from "@atproto/oauth-client-node";
import { getSupabaseClient } from "src/lib/supabaseClient";

function buildClientMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_EXTERNAL_URL;

  if (!baseUrl || !baseUrl.startsWith("https:")) {
    // ローカル開発: ループバック用メタデータ
    return buildAtprotoLoopbackClientMetadata({
      scope: "atproto",
      redirect_uris: ["http://127.0.0.1:15010/moderation_beta/oauth/callback"],
    });
  }

  // 本番: 公開URLを使ったメタデータ
  return {
    client_id: `${baseUrl}/moderation_beta/oauth-client-metadata.json`,
    client_name: "Bluesky公式アカウント移行まとめ モデレーションサイト",
    client_uri: baseUrl,
    redirect_uris: [`${baseUrl}/moderation_beta/oauth/callback`] as [string],
    scope: "atproto",
    grant_types: ["authorization_code", "refresh_token"] as ["authorization_code", "refresh_token"],
    response_types: ["code"] as ["code"],
    token_endpoint_auth_method: "private_key_jwt" as const,
    token_endpoint_auth_signing_alg: "ES256" as const,
    dpop_bound_access_tokens: true,
    jwks_uri: `${baseUrl}/.well-known/jwks.json`,
    application_type: "web" as const,
  };
}

let _client: NodeOAuthClient | null = null;

export async function getOAuthClient(): Promise<NodeOAuthClient> {
  if (_client) return _client;

  const supabase = getSupabaseClient();

  const stateStore = {
    async get(key: string): Promise<NodeSavedState | undefined> {
      const { data, error } = await supabase
        .from("oauth_states")
        .select("value")
        .eq("key", key)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data?.value as unknown as NodeSavedState | undefined;
    },
    async set(key: string, value: NodeSavedState): Promise<void> {
      const { error } = await supabase
        .from("oauth_states")
        .upsert({ key, value });
      if (error) throw error;
    },
    async del(key: string): Promise<void> {
      await supabase.from("oauth_states").delete().eq("key", key);
    },
  };

  const sessionStore = {
    async get(sub: string): Promise<NodeSavedSession | undefined> {
      const { data, error } = await supabase
        .from("oauth_sessions")
        .select("value")
        .eq("did", sub)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data?.value as unknown as NodeSavedSession | undefined;
    },
    async set(sub: string, value: NodeSavedSession): Promise<void> {
      const { error } = await supabase
        .from("oauth_sessions")
        .upsert({ did: sub, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    async del(sub: string): Promise<void> {
      await supabase.from("oauth_sessions").delete().eq("did", sub);
    },
  };

  const keyset =
    process.env.OAUTH_PRIVATE_KEY
      ? await import("@atproto/jwk-jose").then(({ JoseKey }) =>
          JoseKey.fromImportable(JSON.parse(process.env.OAUTH_PRIVATE_KEY!))
        ).then((key) => import("@atproto/jwk").then(({ Keyset }) => new Keyset([key])))
      : undefined;

  _client = new NodeOAuthClient({
    clientMetadata: buildClientMetadata(),
    stateStore,
    sessionStore,
    keyset,
  });

  return _client;
}
