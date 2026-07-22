// This legacy webhook handler is intentionally left as a stub.
// The site is configured for information and scheduling only and does not process payments.

export default async function () {
  return new Response(
    JSON.stringify({ received: true, message: 'Payments are not supported for this site' }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
