import type { ReactNode } from "react";
import { Butterfly, ButterflyTrail } from "../Butterflies";
import { Sparkle } from "./Sparkle";

type Props = {
  kicker?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function WishlistAdminHero({ kicker = "Espace gérant", title, description, actions }: Props) {
  return (
    <header className="relative z-[1] overflow-hidden border-b border-border px-6 py-12 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,oklch(88%_0.10_295_/_0.45),transparent)]" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 opacity-15 rotate-[8deg]">
        <ButterflyTrail size={280} />
      </div>
      <div className="pointer-events-none absolute -right-12 top-0 opacity-12 rotate-[8deg]">
        <ButterflyTrail size={240} />
      </div>
      <div className="pointer-events-none absolute right-[12%] top-[18%] animate-public-float-b opacity-50 max-sm:hidden">
        <Butterfly index={1} size={44} />
      </div>
      <div className="relative mx-auto flex max-w-[1140px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 text-center lg:max-w-[640px] lg:text-left">
          <div className="mb-4 flex justify-center lg:justify-start">
            <Butterfly index={0} size={72} className="animate-public-float-a" />
          </div>
          <p className="mb-2 font-heading text-[15px] font-normal uppercase italic tracking-[0.14em] text-primary">
            {kicker}
          </p>
          <h1 className="mb-3 font-heading text-[clamp(32px,5vw,52px)] font-light leading-[1.08] text-text-primary">
            {title}
          </h1>
          <p className="text-[15px] leading-relaxed text-text-secondary">{description}</p>
          <div className="mt-4 flex justify-center gap-2.5 text-price-light lg:justify-start">
            <Sparkle size={9} />
            <Sparkle size={11} className="text-primary" />
            <Sparkle size={9} />
          </div>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap justify-center gap-2.5 lg:justify-end">{actions}</div> : null}
      </div>
    </header>
  );
}
