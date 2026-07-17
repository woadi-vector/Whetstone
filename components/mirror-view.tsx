"use client";

import { useState } from "react";
import Link from "next/link";
import { updateMirrorCards } from "@/app/mirror/actions";
import type { WorkshopMirror } from "@/lib/workshop";

type EditableKey = "themes" | "strengths" | "interests" | "obsessions" | "working_style";
type MirrorViewProps = {
  mirror: { id: string; moodRaw: string; letter: string; profile: WorkshopMirror["profile"]; createdAt: string };
};

const cards: { key: Exclude<EditableKey, "working_style">; label: string; hint: string }[] = [
  { key: "themes", label: "Themes", hint: "The shapes that keep showing up in your attention" },
  { key: "strengths", label: "Strengths", hint: "What comes easily to you that others find hard" },
  { key: "interests", label: "Interests", hint: "What you reach for in your free time" },
  { key: "obsessions", label: "Obsessions", hint: "Things you can't stop noticing or thinking about" },
];

function formattedDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function moodStamp(moodRaw: string) {
  const firstClause = moodRaw.split(/[.!?]/, 1)[0]?.trim().slice(0, 40).trim() ?? "";
  return firstClause ? `${firstClause[0].toLowerCase()}${firstClause.slice(1)}` : "this moment";
}

export default function MirrorView({ mirror }: MirrorViewProps) {
  const [profile, setProfile] = useState(mirror.profile);
  const [editing, setEditing] = useState<EditableKey | null>(null);
  const [newItem, setNewItem] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function beginEdit(key: EditableKey) {
    setError("");
    setNewItem("");
    setEditing(key);
  }

  async function save() {
    setIsSaving(true);
    setError("");
    const result = await updateMirrorCards({ id: mirror.id, profile });
    setIsSaving(false);
    if (result.error) { setError(result.error); return; }
    setEditing(null);
  }

  function cancel() {
    setProfile(mirror.profile);
    setNewItem("");
    setError("");
    setEditing(null);
  }

  function addItem(key: Exclude<EditableKey, "working_style">) {
    const item = newItem.trim();
    if (!item) return;
    setProfile((current) => ({ ...current, [key]: [...current[key], item] }));
    setNewItem("");
  }

  function removeItem(key: Exclude<EditableKey, "working_style">, index: number) {
    setProfile((current) => ({ ...current, [key]: current[key].filter((_, itemIndex) => itemIndex !== index) }));
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-20 pt-8 sm:px-8 sm:pt-14">
      <header className="mirror-rise max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-clay">Mirror</p>
        <h1 className="mt-4 font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">This is what I&apos;m hearing in you</h1>
        <p className="mt-4 text-sm text-muted-ink">Tap anything that doesn&apos;t ring true.</p>
      </header>

      <section className="mirror-rise mirror-rise-delay-1 mt-10 rounded-2xl border border-line border-l-[5px] border-l-clay bg-paper p-7 shadow-[0_16px_45px_rgba(69,51,38,0.07)] sm:p-10">
        <p className="mb-5 inline-flex rounded-full bg-cream px-3 py-1 text-xs text-muted-ink">Mirror captured while {moodStamp(mirror.moodRaw)}, {formattedDate(mirror.createdAt)}.</p>
        <div className="relative">
          <span aria-hidden="true" className="absolute -left-2 -top-10 font-display text-8xl leading-none text-clay/25">&ldquo;</span>
          <blockquote className="relative space-y-5 font-display text-2xl leading-9 text-ink sm:text-3xl sm:leading-[1.35]">{mirror.letter.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</blockquote>
        </div>
      </section>

      <section className="mirror-rise mirror-rise-delay-2 mt-8 grid gap-4 md:grid-cols-2">
        {cards.map(({ key, label, hint }) => (
          <article key={key} className="rounded-2xl border border-line bg-paper p-6">
            <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl text-ink">{label}</h2><p className="mt-1 font-serif text-lg italic leading-6 text-muted-ink">{hint}</p></div><button onClick={() => beginEdit(key)} className="shrink-0 text-sm font-medium text-clay underline underline-offset-4">edit</button></div>
            {editing === key ? (
              <div className="mt-5 space-y-3">
                {profile[key].map((item, index) => <div key={`${item}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-cream px-3 py-2 text-sm"><span>{item}</span><button onClick={() => removeItem(key, index)} aria-label={`Remove ${item}`} className="text-clay">&times;</button></div>)}
                <div className="flex gap-2"><input value={newItem} onChange={(event) => setNewItem(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addItem(key); } }} className="min-w-0 flex-1 rounded-lg border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clay" /><button onClick={() => addItem(key)} className="rounded-lg border border-clay px-3 text-sm text-clay">Add</button></div>
                <EditControls onSave={save} onCancel={cancel} isSaving={isSaving} />
              </div>
            ) : <ul className="mt-5 space-y-2">{profile[key].map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-ink"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />{item}</li>)}</ul>}
          </article>
        ))}
      </section>

      <section className="mirror-rise mirror-rise-delay-3 mt-4 rounded-2xl border border-line bg-paper p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 className="font-display text-2xl text-ink">Working style</h2><p className="mt-1 font-serif text-lg italic leading-6 text-muted-ink">How you tend to make things</p></div><button onClick={() => beginEdit("working_style")} className="shrink-0 text-sm font-medium text-clay underline underline-offset-4">edit</button></div>
        {editing === "working_style" ? <div className="mt-5"><textarea value={profile.working_style} onChange={(event) => setProfile((current) => ({ ...current, working_style: event.target.value }))} className="min-h-28 w-full rounded-lg border border-line bg-cream p-3 text-sm leading-6 outline-none focus:border-clay" /><EditControls onSave={save} onCancel={cancel} isSaving={isSaving} /></div> : <p className="mt-5 font-serif text-2xl leading-8 text-ink">{profile.working_style}</p>}
      </section>
      {error && <p role="alert" className="mt-4 text-sm text-clay-dark">{error}</p>}

      <section className="mirror-rise mirror-rise-delay-3 mt-8 rounded-2xl bg-[#f1dfd6] p-7 sm:p-8"><p className="max-w-2xl font-serif text-2xl leading-8 text-ink">Bring a rough idea or a decision you&apos;re wrestling with. This is a thinking partner that pushes back &mdash; not a coach, not a cheerleader.</p><Link className="mt-6 inline-block rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-clay-dark" href="/workshop">Try a Workshop</Link></section>
    </main>
  );
}

function EditControls({ onSave, onCancel, isSaving }: { onSave: () => void; onCancel: () => void; isSaving: boolean }) {
  return <div className="flex gap-3 pt-2"><button onClick={onSave} disabled={isSaving} className="rounded-full bg-clay px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{isSaving ? "Saving..." : "Save"}</button><button onClick={onCancel} className="text-sm text-muted-ink underline underline-offset-4">Cancel</button></div>;
}
