import { Butterfly } from "../Butterflies";

type Props = {
  message: string;
};

export function WishlistEmptyState({ message }: Props) {
  return (
    <div className="grid justify-items-center py-[70px] text-center">
      <Butterfly index={0} size={72} className="mb-3.5 opacity-50" />
      <p className="font-['Cormorant_Garamond'] text-[22px] text-[oklch(68%_0.16_295)]">{message}</p>
    </div>
  );
}
