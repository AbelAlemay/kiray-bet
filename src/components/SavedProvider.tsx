"use client";

import { useRouter } from "next/navigation";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { getSavedIds, setSaved } from "@/app/saved/actions";

// Which homes the visitor has saved, loaded once in the browser so public pages can
// stay cached for everyone. Toggling updates at once and is undone if saving fails.

type Saved = {
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  count: number;
};

const SavedContext = createContext<Saved | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    getSavedIds().then((saved) => saved && setIds(new Set(saved)));
  }, []);

  function update(id: string, saved: boolean) {
    setIds((current) => {
      const next = new Set(current);
      if (saved) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggle(id: string) {
    const saving = !ids.has(id);
    update(id, saving);
    setSaved(id, saving).then((result) => {
      if (result.ok) return;
      update(id, !saving);
      if (result.signedOut) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    });
  }

  return (
    <SavedContext value={{ isSaved: (id) => ids.has(id), toggle, count: ids.size }}>{children}</SavedContext>
  );
}

export function useSaved() {
  const saved = use(SavedContext);
  if (!saved) throw new Error("useSaved must be used inside SavedProvider");
  return saved;
}
