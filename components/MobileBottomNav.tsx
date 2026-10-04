'use client';

import React, { useState } from 'react';
import { Home, Layers, Sparkles, User, Check, X, Film, Flame, Cloud, Zap } from 'lucide-react';
import { ITelegramUser } from '@/lib/types';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  telegramUser: ITelegramUser;
  onOpenUserModal: () => void;
}

export default function MobileBottomNav({
  activeTab,
  onSelectTab,
  activeCategory,
  onSelectCategory,
  telegramUser,
  onOpenUserModal,
}: MobileBottomNavProps) {
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const categories = [
    { label: 'All Collections', id: 'All', icon: Zap },
    { label: 'Viral Movies', id: 'Viral Movies', icon: Film },
    { label: 'Terabox Exclusives', id: 'Terabox Exclusives', icon: Cloud },
    { label: 'Trending Now', id: 'Trending Now', icon: Flame },
    { label: 'Recommended VIP', id: 'Recommended', icon: Sparkles },
    { label: 'Anime & Series', id: 'Anime', icon: Layers },
  ];

  const handleHomeClick = () => {
    onSelectTab('home');
    onSelectCategory('All');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoriesClick = () => {
    setIsCategorySheetOpen(!isCategorySheetOpen);
  };

  const handleSelectCategoryFromSheet = (catId: string) => {
    onSelectCategory(catId);
    onSelectTab('categories');
    setIsCategorySheetOpen(false);
  };

  const handlePremiumClick = () => {
    onSelectTab('premium');
    onSelectCategory('Terabox Exclusives');
  };

  const handleProfileClick = () => {
    onSelectTab('profile');
    onOpenUserModal();
  };

  return (
    <>
      {/* Category Bottom Sheet Drawer for Mobile */}
      {isCategorySheetOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm sm:hidden"
          onClick={() => setIsCategorySheetOpen(false)}
        >
          <div 
            className="w-full rounded-t-2xl border-t border-white/10 bg-[#12131c] p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#e50914]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Select Category
                </h3>
              </div>
              <button
                onClick={() => setIsCategorySheetOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => {
                const isSelected = activeCategory.toLowerCase() === cat.id.toLowerCase();
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategoryFromSheet(cat.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-[#e50914] bg-[#e50914]/15 text-white shadow-sm'
                        : 'border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`h-3.5 w-3.5 ${isSelected ? 'text-[#e50914]' : 'text-zinc-400'}`} />
                      <span>{cat.label}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#e50914]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Navigation Bar for Mobile (< 640px) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#090a0f]/95 backdrop-blur-xl sm:hidden"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid h-16 grid-cols-4 items-center px-2">
          
          {/* 1. Home */}
          <button
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'home' && activeCategory === 'All'
                ? 'text-[#e50914]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Home className="h-5 w-5" />
              {activeTab === 'home' && activeCategory === 'All' && (
                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#e50914]" />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight">Home</span>
          </button>

          {/* 2. Categories */}
          <button
            onClick={handleCategoriesClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
              isCategorySheetOpen || activeCategory !== 'All'
                ? 'text-[#e50914]'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Layers className="h-5 w-5" />
              {activeCategory !== 'All' && (
                <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e50914] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e50914]"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight truncate max-w-[70px]">
              {activeCategory !== 'All' ? activeCategory : 'Categories'}
            </span>
          </button>

          {/* 3. Premium */}
          <button
            onClick={handlePremiumClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'premium'
                ? 'text-amber-400 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span className="absolute -top-1 -right-2 rounded bg-amber-500/20 px-1 py-0.2 text-[8px] font-bold text-amber-300 border border-amber-500/30">
                VIP
              </span>
            </div>
            <span className="text-[10px] font-medium tracking-tight text-amber-300">Premium</span>
          </button>

          {/* 4. Profile */}
          <button
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'profile'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
              <User className="h-3 w-3 text-zinc-300" />
              {telegramUser.is_premium && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-[#090a0f]" />
              )}
            </div>
            <span className="text-[10px] font-medium tracking-tight truncate max-w-[65px]">
              {telegramUser.username ? `@${telegramUser.username}` : 'Profile'}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
