'use client';

import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';

interface AnnouncementBannerProps {
  text: string;
}

export default function AnnouncementBanner({ text }: AnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!text || isDismissed) return null;

  return (
    <div className="relative border-b border-[#e50914]/30 bg-gradient-to-r from-[#e50914]/20 via-zinc-900 to-[#e50914]/20 px-4 py-2 text-center text-xs sm:text-sm text-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2">
        <Megaphone className="h-4 w-4 shrink-0 text-[#e50914]" />
        <span className="font-medium">{text}</span>
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-2 rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
