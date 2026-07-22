// Supabase Edge Function: google-oauth-start
// Returns a Google OAuth2 consent URL for the admin to authorize calendar access.

export default async function (req: Request) {
  try {
    const params = new URLSearchParams();
    const client_id = Deno.env.get('GOOGLE_OAUTH_CLIENT_ID') || '';
    const redirect_uri = Deno.env.get('GOOGLE_OAUTH_REDIRECT_URI') || '';
    if (!client_id || !redirect_uri) return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 500 });

    params.set('client_id', client_id);
    params.set('redirect_uri', redirect_uri);
    params.set('response_type', 'code');
    params.set('scope', 'https://www.googleapis.com/auth/calendar');
    params.set('access_type', 'offline');
    params.set('prompt', 'consent');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return new Response(JSON.stringify({ url: authUrl }), { headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('google-oauth-start error', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
