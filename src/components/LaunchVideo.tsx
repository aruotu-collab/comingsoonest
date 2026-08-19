import { youtubeEmbedSrc } from "@/lib/youtube";

export function LaunchVideo({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const src = youtubeEmbedSrc(url);
  if (!src) return null;

  return (
    <section className="panel mb-6 rounded-2xl p-5 md:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl">
        See the product
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Official or editorial look at what’s coming.
      </p>
      <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-[var(--line)] bg-black/40">
        <iframe
          src={src}
          title={title}
          className="h-full w-full"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </section>
  );
}
