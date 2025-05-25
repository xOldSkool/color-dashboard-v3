'use client';
import { useSidebarStore } from '@/store/useSidebarStore';
import { Blocks, ChartColumn, CircleHelp, ClipboardList, FileStack, House, Layers, Move3d, Settings, SquareCode, SwatchBook } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Tooltip from '../Tooltip';
import { JSX } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: House },
  { label: 'Ricettario', href: '/ricettario', icon: SwatchBook },
  { label: 'Magazzino', href: '/magazzino', icon: Layers },
  { label: 'Materiali', href: '/materiali', icon: Blocks },
  {
    label: 'Recupero colori',
    href: '/recupero-colori',
    icon: Move3d,
  },
  {
    label: 'Inventario',
    href: '/inventario',
    icon: ClipboardList,
  },
  { label: 'Statistiche', href: '/statistiche', icon: ChartColumn },
  { label: 'Documenti', href: '/documenti', icon: FileStack },
  { label: 'F.A.Q.', href: '/faq', icon: CircleHelp },
  { label: 'Impostazioni', href: '/impostazioni', icon: Settings },
  { label: 'Dev', href: '/dev', icon: SquareCode },
];

const liClasses = 'my-3';
const linkClasses =
  'group flex items-center cursor-pointer p-3 rounded-lg text-[var(--text)] hover:text-[var(--accent)] transition-colors text-lg border-1 border-transparent hover:border-1 hover:border-dashed hover:border-[var(--border)]';
const linkClassesActive =
  'group flex items-center cursor-pointer p-3 rounded-lg bg-[var(--foreground)] text-[var(--text-inverted)] transition-colors text-lg hover:text-[var(--accent)]';
const iconClasses = 'w-7 h-7 min-w-7 text-inherit group-hover:text-[var(--accent)] transition-colors';
const iconClassesActive = 'w-7 h-7 min-w-7 text-inherit transition-colors';

export default function Navbar(): JSX.Element {
  const path = usePathname();
  const { isOpen } = useSidebarStore();

  return (
    <ul>
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = path === href;
        const link = (
          <Link href={href} className={`${isActive ? linkClassesActive : linkClasses} ${!isOpen && 'justify-center'}`}>
            <Icon className={`${isActive ? iconClassesActive : iconClasses} ${isOpen && 'mr-3'}`} />
            {isOpen && <span>{label}</span>}
          </Link>
        );

        return (
          <li key={href} className={liClasses}>
            {!isOpen ? (
              <Tooltip tooltip={label} position="right">
                {link}
              </Tooltip>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );
}
