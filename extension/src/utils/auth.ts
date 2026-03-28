const API_ORIGIN = process.env.AUTH_API_ORIGIN || "http://localhost:3000";
const AUTH_PATH = `${API_ORIGIN}/api/auth`;

export async function sendOtp(email: string) {
  const res = await fetch(AUTH_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "send-otp", email }),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to send OTP");
  }

  return await res.json();
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(AUTH_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "verify-otp", email, otp }),
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Failed to verify OTP");
  }

  return await res.json();
}

export async function fetchSession() {
  const res = await fetch(`${API_ORIGIN}/api/user/get-session`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }

  return await res.json();
}

export async function storeToken(token: string) {
  if (typeof chrome !== "undefined" && chrome.storage?.local?.set) {
    chrome.storage.local.set({ authToken: token });
  }
}
