import type { ReactNode } from "react";
import { ButterflyTrail } from "../Butterflies";

type Props = {
  children: ReactNode;
};

export function WishlistPageShell({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg-white font-['Nunito'] text-text-dark">
      <div className="pointer-events-none fixed bottom-0 left-0 z-0 opacity-[0.07] rotate-[5deg] max-sm:hidden">
        <ButterflyTrail size={500} />
      </div>
      <div className="pointer-events-none fixed right-0 top-0 z-0 opacity-[0.06] rotate-[185deg] max-sm:hidden">
        <ButterflyTrail size={460} />
      </div>
      {children}
    </div>
  );
}
