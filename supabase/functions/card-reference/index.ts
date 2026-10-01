// Collectors Sports — secure card reference lookup
// Supabase Edge Function. Keep CARDSIGHTAI_API_KEY as a Supabase secret; never expose it
// in the browser bundle or commit it to GitHub.

const CARD_SIGHT_BASE = 'https://api.cardsight.ai';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(data: unknown, status = 200, cache = 'no-store') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cache,
    },
  });
}

async function cardSight(path: string) {
  const apiKey = Deno.env.get('CARDSIGHTAI_API_KEY');
  if (!apiKey) throw new Error('CARDSIGHTAI_API_KEY is not configured');
  const response = await fetch(`${CARD_SIGHT_BASE}${path}`, {
    headers: { 'X-API-Key': apiKey, Accept: 'application/json' },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`CardSight ${response.status}: ${body.slice(0, 240)}`);
  }
  return response;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const cardId = url.searchParams.get('card_id')?.trim();

  try {
    // Fetch a canonical catalog image after the UI has selected a CardSight card id.
    if (cardId) {
      const response = await cardSight(`/v1/images/cards/${encodeURIComponent(cardId)}?format=json`);
      const payload = await response.json();
      return json(
        { cardId, image: payload.data ?? null, contentType: payload.contentType ?? null, size: payload.size ?? null },
        200,
        'public, max-age=86400, stale-while-revalidate=604800',
      );
    }

    const q = url.searchParams.get('q')?.trim();
    if (!q || q.length < 2) return json({ error: 'Query q must contain at least 2 characters' }, 400);

    const takeRaw = Number(url.searchParams.get('take') || 12);
    const take = Math.max(1, Math.min(Number.isFinite(takeRaw) ? takeRaw : 12, 25));
    const params = new URLSearchParams({ q, take: String(take) });

    const year = url.searchParams.get('year')?.trim();
    const segment = url.searchParams.get('segment')?.trim();
    const manufacturer = url.searchParams.get('manufacturer')?.trim();
    if (year) params.set('year', year);
    if (segment) params.set('segment', segment);
    if (manufacturer) params.set('manufacturer', manufacturer);

    const response = await cardSight(`/v1/catalog/search?${params.toString()}`);
    const payload = await response.json();
    const results = Array.isArray(payload.results) ? payload.results : [];

    const cards = results
      .filter((item: any) => item?.type === 'card' && item?.id)
      .map((item: any) => ({
        id: item.id,
        name: item.name ?? '',
        number: item.number ?? item.cardNumber ?? null,
        year: item.year ?? null,
        setName: item.setName ?? null,
        releaseName: item.releaseName ?? null,
        manufacturerName: item.manufacturerName ?? null,
        relevance: item.relevance ?? null,
      }));

    return json({ query: q, cards, total: cards.length }, 200, 'public, max-age=300');
  } catch (error) {
    console.error(error);
    return json({ error: 'Card reference provider unavailable' }, 502);
  }
});
