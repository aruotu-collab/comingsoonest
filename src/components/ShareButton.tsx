"use client";

import { useEffect, useRef, useState } from "react";

export function ShareButton({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for older browsers
      window.prompt("Copy this link", url);
    }
  }

  async function shareNative() {
    try {
      await navigator.share({ title, text, url });
      setOpen(false);
    } catch {
      // User cancelled or share failed — keep menu open
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${text}\n${url}`);
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`;
  const waHref = `https://wa.me/?text=${encodedText}`;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
      >
        Share
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-52 rounded-2xl border border-[var(--line)] bg-[var(--bg-panel)] p-2 shadow-xl">
          {canNativeShare && (
            <button
              type="button"
              onClick={shareNative}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5"
            >
              Share via device…
            </button>
          )}
          <button
            type="button"
            onClick={copyLink}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-white/5"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            href={xHref}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Share on X
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl px-3 py-2 text-sm hover:bg-white/5"
            onClick={() => setOpen(false)}
          >
            Share on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
