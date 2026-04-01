interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

interface ZohoTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
  api_domain?: string;
}

let tokenCache: TokenCache | null = null;
let discoveredApiBaseUrl: string | null = null;

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

function getDataCenterSuffixFromHost(hostname: string): string | null {
  const match = hostname.toLowerCase().match(/(?:^|\.)zohoapis\.([a-z0-9.-]+)$/);
  return match?.[1] ?? null;
}

function getDataCenterSuffix(): string | null {
  const explicit = process.env.ZOHO_DATA_CENTER?.trim().toLowerCase();
  if (explicit) {
    return explicit.replace(/^\./, "");
  }

  const apiBaseUrl = process.env.ZOHO_API_BASE_URL?.trim();
  if (apiBaseUrl) {
    try {
      const parsed = new URL(apiBaseUrl);
      return getDataCenterSuffixFromHost(parsed.hostname);
    } catch {
      // Ignore malformed URLs here; status and requests will surface the issue later.
    }
  }

  const accountsUrl = process.env.ZOHO_ACCOUNTS_URL?.trim();
  if (accountsUrl) {
    try {
      const parsed = new URL(accountsUrl);
      const host = parsed.hostname.toLowerCase();
      const match = host.match(/^accounts\.zoho\.([a-z0-9.-]+)$/);
      return match?.[1] ?? null;
    } catch {
      // Ignore malformed URLs here too.
    }
  }

  return null;
}

function getAccountsUrl(): string {
  const explicit = process.env.ZOHO_ACCOUNTS_URL?.trim();
  if (explicit) {
    return normalizeBaseUrl(explicit);
  }

  const suffix = getDataCenterSuffix();
  return normalizeBaseUrl(`https://accounts.zoho.${suffix ?? "eu"}`);
}

export function getDiscoveredZohoApiBaseUrl(): string | null {
  return discoveredApiBaseUrl;
}

export async function getZohoAccessToken(): Promise<string> {
  const now = Date.now();

  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.ZOHO_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_CLIENT_SECRET?.trim();
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho OAuth credentials are not configured (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN).");
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${getAccountsUrl()}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const rawText = await response.text();
  let data: ZohoTokenResponse;

  try {
    data = rawText ? (JSON.parse(rawText) as ZohoTokenResponse) : {};
  } catch {
    data = {};
  }

  if (!response.ok || data.error || !data.access_token) {
    const errorCode = data.error ?? `HTTP ${response.status} ${response.statusText}`;
    const errorDescription = data.error_description ? ` ${data.error_description}` : "";
    const hint =
      errorCode === "invalid_client_secret"
        ? " Check that ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_REFRESH_TOKEN belong to the same Zoho data center as the configured accounts URL."
        : "";
    throw new Error(`Zoho token refresh error: ${errorCode}.${errorDescription}${hint}`);
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 3600) * 1000,
  };

  if (data.api_domain && typeof data.api_domain === "string" && data.api_domain.trim()) {
    discoveredApiBaseUrl = normalizeBaseUrl(`${data.api_domain.trim()}/crm/v6`);
  }

  return tokenCache.accessToken;
}

export function invalidateZohoTokenCache(): void {
  tokenCache = null;
}
