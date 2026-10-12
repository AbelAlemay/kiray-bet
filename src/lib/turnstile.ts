import "server-only";

// Checks a Turnstile token with Cloudflare. Passes when Turnstile isn't configured,
// so local development works without keys.
export async function passedBotCheck(formData: FormData) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const token = String(formData.get("turnstileToken") ?? "");
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
