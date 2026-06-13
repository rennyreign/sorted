const AUTH_KEY = "sorted_operator_session"
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

const VALID_USERNAME = process.env.NEXT_PUBLIC_OPERATOR_USERNAME || "sorted"
const VALID_PASSWORD = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD || "sorted2026"

interface Session {
  token: string
  timestamp: number
}

function token(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return false
  try {
    const s = JSON.parse(raw) as Session
    return Date.now() - s.timestamp < SESSION_DURATION
  } catch {
    return false
  }
}

export function login(_username: string, password: string): boolean {
  if (password === VALID_PASSWORD) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token: token(), timestamp: Date.now() }))
    return true
  }
  return false
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY)
}
