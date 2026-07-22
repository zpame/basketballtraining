// Supabase Edge Function: expand-recurring
// Expands an availability's RRULE into concrete availability rows server-side.
// Request body: { availability_id: string }

export default async function (req: Request) {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return new Response(JSON.stringify({ error: 'server not configured' }), { status: 500 });

    const body = await req.json().catch(() => ({}));
    const availability_id = body.availability_id;
    if (!availability_id) return new Response(JSON.stringify({ error: 'missing availability_id' }), { status: 400 });

    // Load availability
    const availRes = await fetch(`${SUPABASE_URL}/rest/v1/availability?id=eq.${encodeURIComponent(availability_id)}&select=*`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
    });
    if (!availRes.ok) return new Response(JSON.stringify({ error: 'failed to load availability' }), { status: 500 });
    const rows = await availRes.json();
    const a = Array.isArray(rows) ? rows[0] : rows;
    if (!a) return new Response(JSON.stringify({ error: 'availability not found' }), { status: 404 });
    if (!a.recurring_rule) return new Response(JSON.stringify({ error: 'no recurring rule' }), { status: 400 });

    function parseRRule(rrule: string) {
      const parts = rrule.split(';').reduce((acc: any, p) => { const [k,v] = p.split('='); acc[k] = v; return acc }, {});
      const freq = parts.FREQ;
      const byday = parts.BYDAY ? parts.BYDAY.split(',') : [];
      let until: Date | null = null;
      if (parts.UNTIL) {
        const u = parts.UNTIL;
        const year = parseInt(u.slice(0,4),10);
        const month = parseInt(u.slice(4,6),10)-1;
        const day = parseInt(u.slice(6,8),10);
        until = new Date(Date.UTC(year, month, day, 23, 59, 59));
      }
      return { freq, byday, until };
    }

    const r = parseRRule(a.recurring_rule);
    const startBase = new Date(a.start);
    const endBase = new Date(a.end);
    const durationMs = endBase.getTime() - startBase.getTime();
    const occurrences: any[] = [];
    const until = r.until || new Date(new Date().getFullYear() + 1, 0, 1);
    const maxOccurrences = 365;

    let cursor = new Date(startBase);
    let count = 0;
    while (cursor <= until && count < maxOccurrences) {
      if (r.freq === 'WEEKLY') {
        const dow = ['SU','MO','TU','WE','TH','FR','SA'][cursor.getDay()];
        if (r.byday.includes(dow) && cursor >= startBase) {
          const start = new Date(cursor);
          start.setHours(startBase.getHours(), startBase.getMinutes(), startBase.getSeconds(), 0);
          const end = new Date(start.getTime() + durationMs);
          occurrences.push({ coach_id: a.coach_id, start: start.toISOString(), end: end.toISOString(), recurring_rule: null, is_blocked: a.is_blocked });
          count++;
        }
        cursor.setDate(cursor.getDate() + 1);
      } else if (r.freq === 'DAILY') {
        if (cursor >= startBase) {
          const start = new Date(cursor);
          start.setHours(startBase.getHours(), startBase.getMinutes(), startBase.getSeconds(), 0);
          const end = new Date(start.getTime() + durationMs);
          occurrences.push({ coach_id: a.coach_id, start: start.toISOString(), end: end.toISOString(), recurring_rule: null, is_blocked: a.is_blocked });
          count++;
        }
        cursor.setDate(cursor.getDate() + 1);
      } else if (r.freq === 'MONTHLY') {
        if (cursor >= startBase) {
          const start = new Date(cursor);
          start.setHours(startBase.getHours(), startBase.getMinutes(), startBase.getSeconds(), 0);
          const end = new Date(start.getTime() + durationMs);
          occurrences.push({ coach_id: a.coach_id, start: start.toISOString(), end: end.toISOString(), recurring_rule: null, is_blocked: a.is_blocked });
          count++;
        }
        cursor.setMonth(cursor.getMonth() + 1);
      } else break;
    }

    if (!occurrences.length) return new Response(JSON.stringify({ inserted: 0 }));

    // Batch insert
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < occurrences.length; i += batchSize) {
      const chunk = occurrences.slice(i, i + batchSize);
      const insRes = await fetch(`${SUPABASE_URL}/rest/v1/availability`, {
        method: 'POST',
        headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk)
      });
      if (!insRes.ok) {
        console.error('batch insert failed', await insRes.text());
        return new Response(JSON.stringify({ error: 'batch insert failed' }), { status: 500 });
      }
      const insRows = await insRes.json();
      inserted += Array.isArray(insRows) ? insRows.length : 0;
    }

    return new Response(JSON.stringify({ inserted }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('expand-recurring error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
