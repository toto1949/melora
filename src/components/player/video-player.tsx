export function VideoPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-navy shadow-[var(--shadow-lift)]">
      <video
        className="aspect-video w-full bg-black object-contain"
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={`${title} video`}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support HTML video playback.
      </video>
    </div>
  );
}
