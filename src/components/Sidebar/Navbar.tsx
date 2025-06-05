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
  { label: 'Dev', href: '/dev', icon: SquareCode },
];

const bottomItems: NavItem[] = [
  { label: 'F.A.Q.', href: '/faq', icon: CircleHelp },
  { label: 'Impostazioni', href: '/impostazioni', icon: Settings },
];

const liClasses = 'my-3';

export default function Navbar(): JSX.Element {
  const path = usePathname();
  const { isOpen } = useSidebarStore();
  const Icon0 = bottomItems[0].icon;
  const Icon1 = bottomItems[1].icon;

  return (
    <nav className="flex flex-col h-full">
      {/* NAV ITEMS */}
      <ul>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = path === href;
          const linkBase = isActive ? 'nav-link-active' : 'nav-link';
          const iconBase = isActive ? 'nav-icon-active' : 'nav-icon';
          const link = (
            <Link href={href} prefetch={true} className={`group ${linkBase} ${!isOpen && 'justify-center'}`}>
              <Icon className={`${iconBase} ${isOpen && 'mr-3'}`} />
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

      {/* BOTTOM ITEMS MANUALI */}
      {isOpen && (
        <div className="mt-auto flex flex-row items-center justify-center gap-2 pb-2">
          <div className="justify-center">
            <Link
              href={bottomItems[0].href}
              prefetch={true}
              className={`group ${path === bottomItems[0].href ? 'nav-link-active' : 'nav-link'} flex-row`}
            >
              <Icon0 className="bottom-nav-icon" />
              {isOpen && <span className="text-xs ml-1">{bottomItems[0].label}</span>}
            </Link>
          </div>
          {/* Separatore verticale */}
          <span className="h-6 w-px bg-[var(--border)] mx-1" />
          <div className="justify-center">
            <Link
              href={bottomItems[1].href}
              prefetch={true}
              className={`group ${path === bottomItems[1].href ? 'nav-link-active' : 'nav-link'} flex-row`}
            >
              <Icon1 className="bottom-nav-icon" />
              {isOpen && <span className="text-xs ml-1">{bottomItems[1].label}</span>}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
