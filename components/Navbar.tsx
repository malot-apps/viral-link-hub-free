'use client';

import React from 'react';
import { User as UserIcon, Sparkles, FileCode } from 'lucide-react';
import { ITelegramUser } from '@/lib/types';

interface NavbarProps {
  appName: string;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  telegramUser: ITelegramUser;
  onOpenUserModal: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  liveUsersCount: number;
}

export default function Navbar({
  appName,
  activeCategory,
  onSelectCategory,
  telegramUser,
  onOpenUserModal,
  onOpenAdmin,
  isAdminLoggedIn,
  liveUsersCount,
}: NavbarProps) {
  const navItems = [
    { label: 'All', category: 'All' },
    { label: 'Viral Movies', category: 'Viral Movies' },
    { label: 'Terabox Exclusives', category: 'Terabox Exclusives' },
    { label: 'Trending Now', category: 'Trending Now' },
    { label: 'Recommended', category: 'Recommended' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090a0f]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element Brand Zone with Netflix Red typography & Live Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectCategory('All')}
            className="text-left font-black tracking-tighter text-[#e50914] text-xl sm:text-2xl uppercase transition-opacity hover:opacity-90"
          >
            {appName || 'VIRAL LINK HUB'}
          </button>

          {/* Live Active Counter Badge: 🟢 1,240 Online */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="tabular-nums font-semibold" suppressHydrationWarning>
              {liveUsersCount >= 100 ? liveUsersCount.toLocaleString() : (1240 + liveUsersCount).toLocaleString()}
            </span>{' '}
            Online
          </div>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeCategory.toLowerCase() === item.category.toLowerCase();
            return (
              <button
                key={item.category}
                onClick={() => onSelectCategory(item.category)}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Link to Pure Single-File HTML App */}
          <a
            href="/viral-link-hub.html"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-zinc-300 hover:border-white/20 hover:bg-white/10 hover:text-white transition-colors"
            title="Open pure single-file HTML version"
          >
            <FileCode className="h-3.5 w-3.5 text-netflix-red text-[#e50914]" />
            <span>Single-File HTML</span>
          </a>

          {/* Telegram User Identity Button */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:bg-zinc-800"
            title="Switch Simulated Telegram User"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e50914]/20 text-[#e50914]">
              <UserIcon className="h-3 w-3" />
            </div>
            <span className="max-w-[100px] truncate font-medium sm:max-w-[130px]">
              {telegramUser.username ? `@${telegramUser.username}` : telegramUser.first_name}
            </span>
            {telegramUser.is_premium && (
              <Sparkles className="h-3 w-3 text-amber-400" />
            )}
          </button>
        </div>
      </div>

      {/* Tablet Category Bar (Hidden on mobile <640px where MobileBottomNav takes over) */}
      <div className="hidden sm:flex lg:hidden overflow-x-auto border-t border-white/5 px-4 py-2 scrollbar-none">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = activeCategory.toLowerCase() === item.category.toLowerCase();
            return (
              <button
                key={item.category}
                onClick={() => onSelectCategory(item.category)}
                className={`whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
