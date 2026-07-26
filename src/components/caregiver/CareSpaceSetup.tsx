"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

import { useCare } from "./CareProvider";

export function CareSpaceSetup() {
  const { careSpaceId, isLiveLoading, createCareSpace } = useCare();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (careSpaceId !== null) {
    return null;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (trimmedName === "") {
      setError("Give this care space a name first.");
      return;
    }

    setError(null);

    try {
      await createCareSpace(trimmedName, description.trim() || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the care space.");
    }
  }

  return (
    <Card tone="gold" className="mt-8 p-6 sm:p-7">
      <p className="text-xs font-medium tracking-wide text-olive-500 uppercase">One last step</p>
      <h2 className="mt-2 text-2xl text-olive-900">Create your live care space</h2>
      <p className="mt-2 max-w-2xl leading-relaxed text-olive-600">
        This is the shared Supabase home for tasks, reminders, documents, and assistant answers.
        Once it exists, everything you add will sync to the backend.
      </p>

      <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={submit}>
        <label className="text-sm font-medium text-olive-800">
          Care space name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Mum’s care"
            className="mt-1.5 h-11 w-full rounded-2xl border border-gold-200 bg-white px-3.5 text-olive-900 outline-none transition focus:border-clay-400"
          />
        </label>
        <label className="text-sm font-medium text-olive-800">
          Short description <span className="font-normal text-olive-400">(optional)</span>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Recovery and daily support"
            className="mt-1.5 h-11 w-full rounded-2xl border border-gold-200 bg-white px-3.5 text-olive-900 outline-none transition focus:border-clay-400"
          />
        </label>
        <Button type="submit" disabled={isLiveLoading}>
          {isLiveLoading ? "Saving…" : "Create care space"}
        </Button>
      </form>
      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
    </Card>
  );
}
