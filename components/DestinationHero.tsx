import Link from "next/link";

export function DestinationHero({
  name,
  country,
  image,
  shortDescription,
}: {
  name: string;
  country: string;
  image?: string;
  shortDescription?: string;
}) {
  return (
    <div className="relative h-[40vh] w-full overflow-hidden md:h-[50vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${image || '/placeholder.jpg'}")` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 flex w-full justify-center px-4 pb-20 md:px-20">
        <div className="w-full max-w-7xl">
          <div className="mb-6 flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-black/10 px-3 py-1 text-sm font-bold uppercase tracking-widest text-white/80 backdrop-blur-sm">
            <Link href="/" className="cursor-pointer transition-colors hover:text-primary">Home</Link>
            <span className="text-white/40">/</span>
            <span className="text-white">Destination</span>
          </div>
          <Link
            href={`/country/${encodeURIComponent(country)}`}
            className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/20 bg-primary/90 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-primary-foreground backdrop-blur-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">public</span>
            {country}
          </Link>
          <h1 className="mb-4 text-4xl font-black leading-none tracking-tight text-white drop-shadow-md md:text-6xl">{name}</h1>
          {shortDescription && (
            <p className="max-w-2xl text-lg font-medium leading-relaxed text-white/90 drop-shadow-sm md:text-xl">{shortDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
}
