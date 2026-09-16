// One-time bootstrap for the very first admin account. There is no public
// admin sign-up page (by design — see domain/admins/); every admin after
// this one is created from inside the panel at /admin/admins, which needs at
// least one admin to already exist.
//
// Usage:
//   node scripts/seed-admin.mjs "Full Name" admin@example.com "a strong password"
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local (same file `next dev` uses) — no extra dependency required.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  let text;
  try {
    text = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  } catch {
    return; // fine — the values might already be in the shell environment
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadEnvLocal();

  const [fullName, email, password] = process.argv.slice(2);
  if (!fullName || !email || !password) {
    console.error('Usage: node scripts/seed-admin.mjs "Full Name" admin@example.com "password"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (check .env.local).");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: "admin" },
  });

  if (error) {
    console.error(`Failed to create admin: ${error.message}`);
    process.exit(1);
  }

  console.log(`Admin account created for ${data.user.email} (id: ${data.user.id}).`);
  console.log("Sign in at /login — from there, add more admins at /admin/admins.");
}

main();
