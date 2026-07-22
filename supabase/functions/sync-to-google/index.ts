// Supabase Edge Function scaffold: sync-to-google
// Purpose: create or update Google Calendar events for bookings using stored refresh token
// TODO: implement OAuth token exchange, store encrypted refresh token in `integrations` table,
// and use Google's Calendar API to create events.

export default async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // body: { booking_id }
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return new Response(JSON.stringify({ error: 'server not configured' }), { status: 500 });

    const booking_id = body.booking_id;
    if (!booking_id) return new Response(JSON.stringify({ error: 'missing booking_id' }), { status: 400 });

    // Load booking to get coach_id, start, end, and details
    const bookingRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(booking_id)}&select=*`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
    });
    if (!bookingRes.ok) return new Response('failed to load booking', { status: 500 });
    const bookings = await bookingRes.json();
    const booking = Array.isArray(bookings) ? bookings[0] : bookings;
    if (!booking) return new Response('booking not found', { status: 404 });

    const coach_id = booking.coach_id;

    // Load integration (refresh token)
    const integRes = await fetch(`${SUPABASE_URL}/rest/v1/integrations?coach_id=eq.${encodeURIComponent(coach_id)}&provider=eq.google&select=*`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
    });
    if (!integRes.ok) return new Response('failed to load integration', { status: 500 });
    const ints = await integRes.json();
    const integ = Array.isArray(ints) ? ints[0] : ints;
    if (!integ) return new Response('no integration found', { status: 404 });
    const refresh_token = integ.encrypted_token; // assume stored as plaintext for scaffold; encrypt in prod

    // Exchange refresh token for access token
    const client_id = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
    const client_secret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
    if (!client_id || !client_secret) return new Response('google oauth not configured', { status: 500 });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id, client_secret, grant_type: 'refresh_token', refresh_token })
    });
    if (!tokenRes.ok) {
      console.error('refresh token exchange failed', await tokenRes.text());
      return new Response('token refresh failed', { status: 500 });
    }
    const tokenJson = await tokenRes.json();
    const access_token = tokenJson.access_token;

    // Build calendar event
    const event = {
      summary: `Booking with ${booking.user_id}`,
      description: booking.description || 'Basketball session',
      start: { dateTime: booking.start },
      end: { dateTime: booking.end }
    };

    // Insert event into primary calendar
    const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (!calRes.ok) {
      console.error('google calendar insert failed', await calRes.text());
      return new Response('failed to create google event', { status: 500 });
    }
    const created = await calRes.json();

    // Update booking with google_event_id
    await fetch(`${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(booking_id)}`, {
      method: 'PATCH',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_event_id: created.id })
    });

    return new Response(JSON.stringify({ success: true, google_event_id: created.id }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('sync-to-google error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
