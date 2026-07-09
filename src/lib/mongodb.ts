/**
 * Browser-safe API client.
 *
 * Important: do not import the `mongodb` driver anywhere under `src/`.
 * MongoDB is a Node.js-only package and must run in `api/` serverless
 * functions on Vercel or in `server/` for local Express development.
 */
export async function connectDB(): Promise<never> {
  throw new Error(
    'connectDB لا يعمل داخل المتصفح. استخدم /api عبر الدالة api()، وضع اتصال MongoDB داخل api/ أو server/ فقط.',
  );
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  return response.json();
}
