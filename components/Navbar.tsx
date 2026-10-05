'use client';

import React from 'react';
import Link from 'next/link';
import { User as UserIcon, Sparkles } from 'lucide-react';
import { ITelegramUser, IUserProfile } from '@/lib/types';

interface NavbarProps {
  appName: string;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  telegramUser: ITelegramUser;
  userProfile?: IUserProfile | null;
  onOpenUserModal: () => void;
  onOpenAdmin?: () => void;
  onOpenPremium?: () => void;
  isAdminLoggedIn?: boolean;
  liveUsersCount: number;
}

export default function Navbar({
  appName,
  activeCategory,
  onSelectCategory,
  telegramUser,
  userProfile,
  onOpenUserModal,
  onOpenAdmin,
  onOpenPremium,
  isAdminLoggedIn,
  liveUsersCount,
}: NavbarProps) {
  const navItems = [
    { label: 'All', category: 'All' },
    { label: 'Viral Movies', category: 'Viral Movies' },
    { label: 'VIP Cloud', category: 'VIP Cloud' },
    { label: 'Trending', category: 'Trending' },
    { label: 'Recommended', category: 'Recommended' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#090a0f]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectCategory('All')}
            className="text-left font-black tracking-tighter text-[#e50914] text-xl sm:text-2xl uppercase transition-opacity hover:opacity-90"
          >
            {appName || 'VIRAL LINK HUB'}
          </button>

          {/* Real Live Active Counter Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="tabular-nums font-semibold" suppressHydrationWarning>
              {liveUsersCount.toLocaleString()}
            </span>{' '}
            Online
          </div>
        </div>

        {/* Clean text navigation links */}
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeCategory.toLowerCase() === item.category.toLowerCase();
            return (
              <button
                key={item.category}
                onClick={() => onSelectCategory(item.category)}
                className={`text-sm font-medium transition-colors ${
                  isActive ? 'text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* VIP Premium Rewards Button */}
          {onOpenPremium && (
            <button
              onClick={onOpenPremium}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border ${
                userProfile?.isPremiumActive
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-sm shadow-amber-500/20'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              }`}
              title="Unlock 24h VIP Premium"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>
                {userProfile?.isPremiumActive
                  ? 'VIP Active'
                  : `VIP (${userProfile?.adActionsCompleted ?? 0}/3)`}
              </span>
            </button>
          )}

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
            {telegramUser.is_premium && <Sparkles className="h-3 w-3 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Tablet Category Bar */}
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
