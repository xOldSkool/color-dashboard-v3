'use client';
import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="size-10 animate-spin text-gray-500" />
    </div>
  );
}
