'use client';
interface HexProps {
  hex: string;
}
export default function HexToBoxColor({ hex }: HexProps) {
  return <div className="w-6 h-6 rounded" style={{ backgroundColor: hex }}></div>;
}

export function HexToBoxColorID({ hex }: HexProps) {
  return <div className="w-20 h-20 rounded" style={{ backgroundColor: hex }}></div>;
}
