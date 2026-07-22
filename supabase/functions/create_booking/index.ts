// Supabase Edge Function (Deno) - create_booking
// Simplified version without Stripe payment processing
// Responsibilities:
// - validate request
// - create booking row in DB (use Supabase Admin key)
// - return success confirmation

export default async function (req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server not configured' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const { start, end, coach_id, user_id, availability_id, customer } = body;
    
    // Validate required fields
    if (!start || !end || !coach_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: start, end, coach_id' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    // Create booking with status 'confirmed' (no payment required)
    const bookingResp = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        user_id: user_id || null,
        coach_id,
        availability_id: availability_id || null,
        start,
        end,
        status: 'confirmed'
      })
    });

    if (!bookingResp.ok) {
      const text = await bookingResp.text();
      console.error('booking insert failed', text);
      return new Response(
        JSON.stringify({ error: 'Failed to create booking' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    const bookingRows = await bookingResp.json();
    const booking = Array.isArray(bookingRows) ? bookingRows[0] : bookingRows;

    return new Response(
      JSON.stringify({
        success: true,
        booking_id: booking.id,
        booking: booking,
        message: 'Booking confirmed!'
      }),
      { headers: { 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error('create_booking error', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}
