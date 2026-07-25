"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Emphasis } from "@/components/ui/Emphasis";
import { Logo, StarMark } from "@/components/ui/Logo";

const inputClass =
  "w-full rounded-2xl border border-bone-300 bg-white px-4 py-3 text-olive-900 " +
  "placeholder:text-olive-400 transition focus:border-clay-400 focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-10">
      <div className="mesh-dawn pointer-events-none absolute inset-0 -z-10" />

      <div className="w-full max-w-md">
        <Link href="/" className="mx-auto flex w-fit justify-center">
          <Logo />
        </Link>

        <Card className="mt-8 p-7 sm:p-8">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-olive-900 text-gold-200">
              <StarMark size={18} />
            </span>
            <div>
              <p className="text-xs font-medium tracking-wide text-olive-400 uppercase">
                Caregiver sign in
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-olive-900">
                Open your <Emphasis>live</Emphasis> care space
              </h1>
            </div>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-olive-800">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="caregiver@example.com"
                autoComplete="email"
                className={`${inputClass} mt-2`}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-olive-800">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputClass} mt-2`}
                required
              />
            </label>

            {error !== null ? (
              <p className="rounded-2xl border border-clay-200 bg-clay-50 px-4 py-3 text-sm text-clay-700">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full justify-center"
              disabled={submitting || email.trim() === "" || password === ""}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Sign in
              {!submitting ? <ArrowRight size={16} /> : null}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-olive-500">
            New caregiver? Run the seed script locally, then sign in with that Supabase user.
          </p>
        </Card>
      </div>
    </main>
  );
}
