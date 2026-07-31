// Affiliate Tracker — Supabase Auth helpers
//
// Thin wrapper over the affiliateDb client for sign-up / sign-in / session.
// Sign-ups create a real auth user; the handle_new_affiliate() DB trigger
// creates a 'pending' affiliates row that an operator must approve.

import { affiliateDb } from "./affiliateClient"
import type { Affiliate } from "./affiliateClient"

export type SignUpInput = {
  email: string
  password: string
  displayName: string
  phone?: string
}

export type SignInInput = {
  email: string
  password: string
}

export type AuthResult =
  | { ok: true; userId: string }
  | { ok: false; error: string }

export async function signUpAffiliate(input: SignUpInput): Promise<AuthResult> {
  const { data, error } = await affiliateDb.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        display_name: input.displayName,
        phone: input.phone ?? null,
      },
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/partners/login`,
    },
  })

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) }
  }
  if (!data.user) {
    return { ok: false, error: "Sign-up did not complete. Please try again." }
  }
  return { ok: true, userId: data.user.id }
}

export async function signInAffiliate(input: SignInInput): Promise<AuthResult> {
  const { data, error } = await affiliateDb.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    return { ok: false, error: friendlyAuthError(error.message) }
  }
  if (!data.user) {
    return { ok: false, error: "Sign-in did not complete. Please try again." }
  }
  return { ok: true, userId: data.user.id }
}

export async function signOutAffiliate(): Promise<void> {
  await affiliateDb.auth.signOut()
}

export async function getCurrentAffiliate(): Promise<Affiliate | null> {
  const {
    data: { user },
  } = await affiliateDb.auth.getUser()
  if (!user) return null

  const { data, error } = await affiliateDb
    .from("affiliates")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (error || !data) return null
  return data as Affiliate
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await affiliateDb.auth.getSession()
  return session
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes("invalid login credentials")) return "Email or password is incorrect."
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead."
  if (m.includes("email rate limit")) return "Too many attempts. Please wait a moment and try again."
  if (m.includes("database error saving new user")) return "Something went wrong creating your account. Please try again or contact support."
  if (m.includes("password")) return "Password must be at least 6 characters."
  if (m.includes("email")) return "Please enter a valid email address."
  return message
}
