'use client';

import { ReactNode } from 'react';

interface TooltipProps {
  tooltip: string;
  children: ReactNode;
  position?: 'top' | 'right';
}

export default function Tooltip({ tooltip, children, position = 'top' }: TooltipProps) {
  const isTop = position === 'top';
  const tooltipClasses = isTop ? 'absolute left-1/2 -translate-x-1/2 bottom-full mb-2' : 'absolute top-1/2 left-full translate-y-[-50%] ml-3';

  const arrowClasses = isTop
    ? 'absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--foreground)] rotate-45'
    : 'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--foreground)] rotate-45';

  return (
    <div className="group relative inline-block">
      {children}
      <div className={`${tooltipClasses} hidden group-hover:block z-10`}>
        <div className="relative text-[var(--text-inverted)] bg-[var(--foreground)] text-md px-2 py-1 rounded whitespace-nowrap">
          {tooltip}
          <div className={arrowClasses}></div>
        </div>
      </div>
    </div>
  );
}
