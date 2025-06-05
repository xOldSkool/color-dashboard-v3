'use client';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import logo from '../../../public/logo.png';
import ThemeToggle from '../ThemeToggle';
import { useSidebarStore } from '@/store/useSidebarStore';
import { JSX } from 'react';
import Navbar from './Navbar';

export default function Sidebar(): JSX.Element {
  const { isOpen, toggleSidebar } = useSidebarStore();

  return (
    <div
      className={`${
        isOpen ? 'w-72' : 'w-20'
      } h-full bg-[var(--background)] p-3 relative duration-300 flex flex-col border-r-1 border-dashed border-[var(--border)]`}
    >
      <div
        className="absolute cursor-pointer -end-5 top-6 bg-[var(--background)] hover:text-[var(--accent)] rounded-full p-2 border-1 border-dashed border-[var(--border)]"
        onClick={() => toggleSidebar()}
      >
        <ArrowLeft className={`size-6 ${!isOpen && 'rotate-180'}`} />
      </div>
      <div className="absolute cursor-pointer -end-5 top-20 bg-[var(--background)] hover:text-[var(--accent)] rounded-full p-2 border-1 border-dashed border-[var(--border)]">
        <ThemeToggle />
      </div>
      <Image src={logo} alt="DSSMITH Logo" className={`h-28 mt-5 mb-10 self-center ${!isOpen && 'invisible'}`} height={112} />
      <Navbar />
    </div>
  );
}
