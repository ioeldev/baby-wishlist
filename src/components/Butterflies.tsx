import butterflyPink from "../assets/butterflies/2.png";
import butterflyPurple from "../assets/butterflies/1.png";
import butterflyTrail from "../assets/butterflies/butt.png";

const singleButterflies = [butterflyPink, butterflyPurple];

type ButterflyProps = {
  index?: number;
  size?: number;
  className?: string;
};

export function Butterfly({ index = 0, size = 80, className = "" }: ButterflyProps) {
  return (
    <img
      src={singleButterflies[index % singleButterflies.length]}
      alt=""
      width={size}
      height={size}
      className={`block object-contain ${className}`}
    />
  );
}

export function ButterflyTrail({ size = 420, className = "" }: Omit<ButterflyProps, "index">) {
  return (
    <img
      src={butterflyTrail}
      alt=""
      width={size}
      height={size}
      className={`pointer-events-none block object-contain ${className}`}
    />
  );
}
