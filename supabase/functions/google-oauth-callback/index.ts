// Supabase Edge Function: google-oauth-callback
// Exchanges code for tokens and stores the refresh_token in `integrations` table

export default async function (req: Request) {
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const client_id = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
    const client_secret = Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET') || '';
    const redirect_uri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI') || '';

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !client_id || !client_secret || !redirect_uri) {
      return new Response('server not configured', { status: 500 });
    }

    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code) return new Response('missing code', { status: 400 });

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id, client_secret, redirect_uri, grant_type: 'authorization_code' })
    });

    if (!tokenRes.ok) {
      console.error('google token exchange failed', await tokenRes.text());
      return new Response('token exchange failed', { status: 500 });
    }
    const tokens = await tokenRes.json();
    const refresh_token = tokens.refresh_token;
    const access_token = tokens.access_token;

    if (!refresh_token) {
      console.error('no refresh token received; ensure access_type=offline and prompt=consent');
      return new Response('no refresh token', { status: 400 });
    }

    // state can contain coach_id to associate integration; for simplicity expect coach_id in query
    const coach_id = url.searchParams.get('coach_id') || undefined;
    if (!coach_id) {
      console.error('missing coach_id in state or params');
      return new Response('missing coach_id', { status: 400 });
    }

    // Store refresh token in integrations table (encrypted storage recommended)
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/integrations`, {
      method: 'POST',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ coach_id, provider: 'google', encrypted_token: refresh_token })
    });

    if (!insertRes.ok) {
      console.error('failed to store integration', await insertRes.text());
      return new Response('failed to store integration', { status: 500 });
    }

    return new Response('ok');
  } catch (err) {
    console.error('google-oauth-callback error', err);
    return new Response(String(err), { status: 500 });
  }
}
