import { Butterfly, ButterflyTrail } from "../Butterflies";
import { Sparkle } from "./Sparkle";

export function WishlistPublicHero() {
  return (
    <header className="relative z-[1] overflow-hidden px-6 py-[60px] text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,oklch(88%_0.10_295_/_0.55),transparent)]" />
      <div className="pointer-events-none absolute -bottom-[60px] -left-[60px] opacity-20 rotate-[10deg]">
        <ButterflyTrail size={380} />
      </div>
      <div className="pointer-events-none absolute -right-[80px] -top-[80px] opacity-15 rotate-[190deg]">
        <ButterflyTrail size={340} />
      </div>
      <div className="pointer-events-none absolute left-[6%] top-[8%] animate-public-float-a opacity-80">
        <Butterfly index={0} size={80} />
      </div>
      <div className="pointer-events-none absolute right-[7%] top-[5%] animate-public-float-b opacity-75">
        <Butterfly index={1} size={68} />
      </div>
      <div className="pointer-events-none absolute left-[14%] top-[62%] animate-public-float-c opacity-50 max-sm:hidden">
        <Butterfly index={0} size={48} />
      </div>
      <div className="pointer-events-none absolute right-[15%] top-[55%] animate-public-float-d opacity-55 max-sm:hidden">
        <Butterfly index={1} size={52} />
      </div>
      <div className="pointer-events-none absolute left-[28%] top-[28%] animate-public-float-b opacity-30 max-sm:hidden">
        <Butterfly index={0} size={30} />
      </div>
      <div className="relative">
        <div className="mb-5 flex justify-center animate-public-float-a">
          <Butterfly index={0} size={100} />
        </div>
        <p className="mb-2.5 font-['Cormorant_Garamond'] text-[15px] font-normal uppercase italic tracking-[0.14em] text-[oklch(68%_0.16_295)]">
          Baby on the way
        </p>
        <h1 className="mb-4 font-['Cormorant_Garamond'] text-[clamp(40px,7vw,70px)] font-light leading-[1.05] text-[oklch(38%_0.18_295)]">
          Notre Liste de Naissance
        </h1>
        <p className="mx-auto max-w-[460px] text-[15px] leading-relaxed text-[oklch(45%_0.10_295)]">
          Choisissez un cadeau à offrir à notre petit trésor qui arrive bientôt.
        </p>
        <div className="mt-5 flex justify-center gap-2.5 text-[oklch(74%_0.13_82)]">
          <Sparkle size={9} />
          <Sparkle size={13} className="text-[oklch(68%_0.16_295)]" />
          <Sparkle size={9} />
        </div>
      </div>
    </header>
  );
}
