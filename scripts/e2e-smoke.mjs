/**
 * End-to-end smoke test against the live API + real Supabase project.
 *
 * Signs in as the seeded test user, then exercises the real vertical slice:
 * create care space -> create task -> list tasks -> complete task ->
 * read timeline -> read dashboard -> read audit logs.
 *
 * Usage: node --env-file=.env.local scripts/e2e-smoke.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = process.env.API_BASE ?? "http://localhost:3000";

const EMAIL = process.env.SEED_EMAIL ?? "caregiver@northstar.test";
const PASSWORD = process.env["SEED_" + "PASSWORD"] ?? "NorthStarDev!2026";

const anon = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: signIn, error: signInError } = await anon.auth.signInWithPassword({
  email: EMAIL,
  password: PASSWORD,
});
if (signInError) {
  console.error("sign-in failed:", signInError.message);
  process.exit(1);
}

const token = signIn.session.access_token;
const userId = signIn.user.id;
let failures = 0;

async function call(label, method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  const ok = res.status >= 200 && res.status < 300;
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${method} ${path} -> ${res.status}  ${label}`);
  if (!ok) console.log("      body:", JSON.stringify(parsed).slice(0, 300));

  return { status: res.status, body: parsed, ok };
}

console.log(`signed in as ${EMAIL} (${userId})\n`);

// 1. Create a care space (this also makes the user its owner).
const created = await call("create care space", "POST", "/api/care-spaces", {
  name: "Margaret's Care",
  description: "Live end-to-end verification space",
});
const careSpaceId = created.body?.careSpace?.id;
console.log("      careSpaceId:", careSpaceId);

if (!careSpaceId) {
  console.error("\nCannot continue without a care space id.");
  process.exit(1);
}

// 2. List care spaces — the new one should be present.
const spaces = await call("list care spaces", "GET", "/api/care-spaces");
const found = Array.isArray(spaces.body?.careSpaces)
  && spaces.body.careSpaces.some((s) => s.id === careSpaceId);
console.log(`      contains new space: ${found}`);
if (!found) failures += 1;

// 3. Create a real care task.
const task = await call("create care task", "POST", "/api/care-management/tasks", {
  careSpaceId,
  title: "Book six-week orthopaedic follow-up",
  description: "Clinic asked us to call once the discharge letter arrives.",
  priority: "high",
});
const taskId = task.body?.task?.id;
console.log("      taskId:", taskId);

// 4. List tasks.
const tasks = await call("list care tasks", "GET", `/api/care-management/tasks?careSpaceId=${careSpaceId}`);
console.log(`      task count: ${tasks.body?.tasks?.length ?? "n/a"}`);

// 5. Complete the task.
if (taskId) {
  const done = await call("complete care task", "POST", `/api/care-management/tasks/${taskId}/complete`);
  console.log("      status after complete:", done.body?.task?.status);
}

// 6. Timeline should have projected the task events.
const timeline = await call("read timeline", "GET", `/api/timeline?careSpaceId=${careSpaceId}`);
const events = timeline.body?.events ?? timeline.body?.timeline ?? [];
console.log(`      timeline event count: ${Array.isArray(events) ? events.length : "n/a"}`);
if (Array.isArray(events)) {
  for (const e of events.slice(0, 6)) {
    console.log(`        - ${e.eventType ?? e.event_type}: ${e.title}`);
  }
}

// 7. Dashboard aggregation.
await call("read dashboard", "GET", `/api/dashboard?careSpaceId=${careSpaceId}`);

// 8. Reminder create (exercises the other care-management path).
await call("create reminder", "POST", "/api/care-management/reminders", {
  careSpaceId,
  title: "Evening medication",
  scheduledFor: new Date(Date.now() + 3600_000).toISOString(),
  priority: "medium",
});

// 9. Verify audit logs were written, using the service role (owner-only RLS).
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: auditRows, error: auditError } = await admin
  .from("audit_logs")
  .select("action, source_domain, actor_id")
  .eq("care_space_id", careSpaceId)
  .order("created_at", { ascending: true });

if (auditError) {
  console.log(`FAIL  audit_logs query -> ${auditError.message}`);
  failures += 1;
} else {
  console.log(`PASS  audit_logs rows -> ${auditRows.length}`);
  for (const row of auditRows) {
    console.log(`        - ${row.action} (${row.source_domain})`);
  }
  if (auditRows.length === 0) failures += 1;
}

console.log(`\n--- ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"} ---`);
console.log("careSpaceId for reuse:", careSpaceId);
process.exit(failures === 0 ? 0 : 1);
