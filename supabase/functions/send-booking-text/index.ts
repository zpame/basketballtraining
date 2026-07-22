export default async function (req: Request) {
  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  } as Record<string, string>;

  // Respond to CORS preflight quickly
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const jsonResponse = (payload: any, status = 200) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'content-type': 'application/json', ...CORS_HEADERS },
    });

  try {
    const body = await req.json().catch(() => ({}));
    const { name, phone, email, notes, selectedSession } = body;

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '';
    const toNumber = Deno.env.get('BOOKING_SMS_TO') || '4192905062';

    if (!accountSid || !authToken || !fromNumber) {
      return jsonResponse({ error: 'SMS service not configured' }, 500);
    }

    const message = `Booking request from ${name || 'N/A'} for ${selectedSession ? `${selectedSession.date} ${selectedSession.time}` : 'N/A'}\nPhone: ${phone || 'N/A'}\nEmail: ${email || 'N/A'}\nNotes: ${notes || 'N/A'}`;

    try {
      const auth = btoa(`${accountSid}:${authToken}`);
      const form = new URLSearchParams({ To: toNumber, From: fromNumber, Body: message });

      const resp = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + accountSid + '/Messages.json', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form,
      });

      const result = await resp.text();
      if (!resp.ok) {
        return jsonResponse({ error: 'SMS send failed', details: result }, 500);
      }

      return jsonResponse({ success: true, message: 'Booking request sent' }, 200);
    } catch (err) {
      return jsonResponse({ error: err instanceof Error ? err.message : 'SMS send failed' }, 500);
    }
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
}
