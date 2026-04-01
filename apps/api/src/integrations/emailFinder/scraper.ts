/**
 * Lightweight fallback email finder.
 *
 * When the TinyFish agent returns no email addresses for a company, this module
 * independently fetches common contact/impressum/team/legal page candidates and
 * extracts mailto: hrefs and plaintext email addresses from the raw HTML.
 *
 * No headless browser is required - mailto: links and visible email addresses
 * are present in the static HTML of most business sites.
 */

const CONTACT_PATH_CANDIDATES = [
  "/contact",
  "/contact-us",
  "/contactus",
  "/get-in-touch",
  "/reach-us",
  "/talk-to-us",
  "/about",
  "/about-us",
  "/team",
  "/our-team",
  "/people",
  "/leadership",
  "/founders",
  "/company",
  "/privacy",
  "/privacy-policy",
  "/legal",
  "/legal-notice",
  "/impressum",
  "/imprint",
  "/kontakt",
  "/kapcsolat",
  "/careers",
  "/jobs",
];

const PAGE_KEYWORDS = [
  "contact",
  "about",
  "team",
  "people",
  "leadership",
  "founder",
  "privacy",
  "legal",
  "impressum",
  "imprint",
  "career",
  "job",
  "people",
  "company",
  "reach",
  "talk",
  "kontakt",
  "kapcsolat",
];

const FETCH_TIMEOUT_MS = 6_000;
const MAX_PAGES_TO_FETCH = 8;

// Matches standard email addresses in text or attribute values.
const EMAIL_PATTERN = /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g;

// Common false positives found in HTML/CSS source.
const FALSE_POSITIVE_PATTERNS = [
  /@\d+x\b/,
  /@media\b/i,
  /\.(?:png|jpg|jpeg|gif|svg|webp|css|js)@/i,
  /example\.com$/i,
  /yourdomain/i,
  /placeholder/i,
  /sentry\.io/i,
  /amplitude\.com/i,
  /segment\.io/i,
  /cloudfront\.net/i,
];

function isLikelyRealEmail(email: string): boolean {
  if (email.includes("..")) return false;
  if (email.startsWith(".") || email.endsWith(".")) return false;
  return !FALSE_POSITIVE_PATTERNS.some((pattern) => pattern.test(email));
}

function normalizeCandidateUrl(rawUrl: string, baseUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }
  if (/^(mailto:|tel:|javascript:)/i.test(trimmed)) {
    return null;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractEmailsFromHtml(html: string): string[] {
  const found = new Set<string>();

  // 1. mailto: href attributes - most reliable
  const mailtoRe = /href=["']mailto:([^"'?\s]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = mailtoRe.exec(html)) !== null) {
    const raw = match[1]?.trim().toLowerCase();
    if (raw && isLikelyRealEmail(raw)) {
      found.add(raw);
    }
  }

  // 2. Plaintext email patterns - catches footer / contact page text
  const plainMatches = html.match(EMAIL_PATTERN) ?? [];
  for (const raw of plainMatches) {
    const email = raw.toLowerCase().trim();
    if (isLikelyRealEmail(email)) {
      found.add(email);
    }
  }

  return [...found];
}

function extractInternalCandidateUrls(html: string, baseUrl: string): string[] {
  const candidates = new Set<string>();
  const hrefRe = /href=["']([^"'#]+)["']/gi;
  let match: RegExpExecArray | null;

  while ((match = hrefRe.exec(html)) !== null) {
    const normalized = normalizeCandidateUrl(match[1] ?? "", baseUrl);
    if (!normalized) {
      continue;
    }

    try {
      const url = new URL(normalized);
      const path = `${url.pathname}${url.search}`.toLowerCase();
      const looksRelevant = PAGE_KEYWORDS.some((keyword) => path.includes(keyword));
      if (url.origin === new URL(baseUrl).origin && looksRelevant) {
        candidates.add(url.toString());
      }
    } catch {
      // ignore malformed URLs
    }
  }

  return [...candidates];
}

async function fetchPageHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Scoutbound/1.0; +https://scoutbound.app)",
        Accept: "text/html",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export interface EmailScrapeResult {
  emails: string[];
  pagesChecked: string[];
  pagesWithEmails: string[];
}

/**
 * Finds contact emails for a company website by fetching the homepage, obvious
 * contact-like pages, and additional pages discovered from homepage links.
 */
export async function findContactEmails(
  websiteUrl: string,
  knownContactPageUrl?: string | null,
): Promise<EmailScrapeResult> {
  let startUrl: string;
  let baseOrigin: string;

  try {
    const parsed = new URL(websiteUrl);
    startUrl = parsed.toString();
    baseOrigin = parsed.origin;
  } catch {
    return { emails: [], pagesChecked: [], pagesWithEmails: [] };
  }

  const candidateUrls: string[] = [];
  const homepageHtml = await fetchPageHtml(startUrl);

  candidateUrls.push(startUrl);

  if (knownContactPageUrl) {
    const normalized = normalizeCandidateUrl(knownContactPageUrl, startUrl);
    if (normalized) {
      candidateUrls.push(normalized);
    }
  }

  for (const path of CONTACT_PATH_CANDIDATES) {
    const normalized = normalizeCandidateUrl(path, baseOrigin);
    if (normalized) {
      candidateUrls.push(normalized);
    }
  }

  if (homepageHtml) {
    for (const linkedUrl of extractInternalCandidateUrls(homepageHtml, startUrl)) {
      candidateUrls.push(linkedUrl);
    }
  }

  const urlsToFetch = [...new Set(candidateUrls)].slice(0, MAX_PAGES_TO_FETCH);

  console.log(`[emailFinder] checking ${urlsToFetch.length} pages for ${baseOrigin}`);

  const htmlResults = await Promise.all(
    urlsToFetch.map(async (url) => ({ url, html: url === startUrl ? homepageHtml : await fetchPageHtml(url) })),
  );

  const allEmails = new Set<string>();
  const pagesChecked: string[] = [];
  const pagesWithEmails: string[] = [];

  for (const { url, html } of htmlResults) {
    if (html === null) continue;
    pagesChecked.push(url);

    const found = extractEmailsFromHtml(html);
    if (found.length > 0) {
      pagesWithEmails.push(url);
      for (const email of found) {
        allEmails.add(email);
      }
    }
  }

  return {
    emails: [...allEmails],
    pagesChecked,
    pagesWithEmails,
  };
}
