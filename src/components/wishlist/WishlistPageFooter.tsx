import { Butterfly } from "../Butterflies";

type Props = {
  message: string;
};

export function WishlistPageFooter({ message }: Props) {
  return (
    <footer className="relative z-[1] border-t border-[oklch(92%_0.07_295)] bg-[oklch(95%_0.03_295)] px-6 py-7 text-center">
      <div className="mb-3 flex justify-center gap-4">
        <Butterfly index={0} size={30} className="animate-public-float-a opacity-55" />
        <Butterfly index={1} size={30} className="animate-public-float-b opacity-55" />
      </div>
      <p className="font-['Cormorant_Garamond'] text-base italic text-[oklch(62%_0.08_295)]">{message}</p>
    </footer>
  );
}
