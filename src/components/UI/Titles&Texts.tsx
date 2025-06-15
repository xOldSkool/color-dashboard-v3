import { ReactNode } from 'react';

type Props = { children: ReactNode; className?: string };

export function H1({ children, className }: Props) {
  return <h1 className={`${className} text-4xl font-semibold pt-2 pb-1`}>{children}</h1>;
}
export function H2({ children, className }: Props) {
  return <h2 className={`${className} text-3xl font-semibold pb-1`}>{children}</h2>;
}
export function H3({ children, className }: Props) {
  return <h3 className={`${className} text-2xl font-semibold pb-1`}>{children}</h3>;
}
export function H4({ children, className }: Props) {
  return <h4 className={`${className} text-xl font-semibold pb-1`}>{children}</h4>;
}
