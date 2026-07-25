/**
 * Seeds a real test user in the live Supabase project and signs them in.
 *
 * Prints an access token that can be used as `Authorization: Bearer <token>`
 * against the local API. Intended for development smoke-testing only.
 *
 * Usage: node --env-file=.env.local scripts/seed-test-user.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error("Missing Supabase env vars. Run with: node --env-file=.env.local");
  process.exit(1);
}

const EMAIL = process.env.SEED_EMAIL ?? "caregiver@northstar.test";
const PASSWORD = process.env.SEED_PASSWORD ?? "NorthStarDev!2026";
const FULL_NAME = "Sarah Whitfield";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw error;
  return data.users.find((u) => u.email === email) ?? null;
}

async function ensureUser() {
  const existing = await findUserByEmail(EMAIL);

  if (existing) {
    console.log(`user already exists: ${existing.id}`);
    return existing;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: FULL_NAME },
  });
  if (error) throw error;

  console.log(`created user: ${data.user.id}`);
  return data.user;
}

async function ensureProfile(user) {
  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: FULL_NAME,
    },
    { onConflict: "id" },
  );
  if (error) throw error;
  console.log("profile upserted");
}

async function signIn() {
  const anon = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });
  if (error) throw error;
  return data.session;
}

const user = await ensureUser();
await ensureProfile(user);
const session = await signIn();

console.log("\n--- SEED RESULT ---");
console.log(JSON.stringify({
  userId: user.id,
  email: EMAIL,
  password: PASSWORD,
  accessToken: session.access_token,
}, null, 2));
