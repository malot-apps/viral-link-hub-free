'use client';

import React from 'react';
import Link from 'next/link';
import {
  Send,
  Film,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Users,
} from 'lucide-react';
import { ISettings } from '@/lib/types';

interface HeroIntroSectionProps {
  settings: ISettings;
  isTelegram?: boolean;
  onBrowseCatalog?: () => void;
}

export default function HeroIntroSection({
  settings,
  isTelegram = false,
  onBrowseCatalog,
}: HeroIntroSectionProps) {
  if (settings.showIntroHero === false) {
    return null;
  }

  const title = settings.introTitle || 'Unlimited Cloud Entertainment & Instant Streaming';
  const subtitle = settings.introSubtitle || 'VIP Fast-Track Access · Official Telegram Community Hub';
  const description =
    settings.introDescription ||
    'Discover exclusive high-speed cloud movies, viral anime releases, and direct VIP links. Join our verified Telegram ecosystem to unlock 4K content with instant direct access.';

  const primaryCtaText = settings.introPrimaryCtaText || 'Join Official Community';
  const primaryCtaUrl = settings.introPrimaryCtaUrl || 'https://t.me/virallinkhub_official';

  const secondaryCtaText = settings.introSecondaryCtaText || 'Browse Movies';
  const secondaryCtaUrl = settings.introSecondaryCtaUrl || '#browse-catalog';

  const handleSecondaryClick = (e: React.MouseEvent) => {
    if (secondaryCtaUrl.startsWith('#')) {
      e.preventDefault();
      if (onBrowseCatalog) {
        onBrowseCatalog();
      } else {
        const el = document.getElementById(secondaryCtaUrl.slice(1)) || document.querySelector('[data-catalog-section]');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePrimaryClick = (e: React.MouseEvent) => {
    if (primaryCtaUrl.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(primaryCtaUrl.slice(1)) || document.getElementById('telegram-destinations');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-gradient-to-b from-[#0e121d] via-[#090b11] to-[#090a0f] py-10 sm:py-16">
      {/* Ambient Radial Highlights */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#0088cc]/10 blur-3xl sm:w-[600px]" />
      <div className="pointer-events-none absolute -bottom-12 right-0 h-72 w-72 rounded-full bg-[#e50914]/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-950/40 px-3.5 py-1 text-xs font-semibold text-sky-400 backdrop-blur-md shadow-sm sm:text-sm">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span className="tracking-wide">{subtitle}</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-tight lg:text-6xl text-balance">
            {title}
          </h1>

          {/* Body Description */}
          <p className="mt-4 text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={primaryCtaUrl}
              onClick={handlePrimaryClick}
              target={primaryCtaUrl.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#00a8ff] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
            >
              <Send className="h-4 w-4" />
              <span>{primaryCtaText}</span>
              <ArrowRight className="h-4 w-4 opacity-75" />
            </a>

            <a
              href={secondaryCtaUrl}
              onClick={handleSecondaryClick}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-zinc-200 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white active:scale-[0.98]"
            >
              <Film className="h-4 w-4 text-[#e50914]" />
              <span>{secondaryCtaText}</span>
            </a>
          </div>

          {/* Ecosystem Highlights Grid */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 pt-6 border-t border-white/5 text-left">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs sm:text-sm">
                <Send className="h-4 w-4" />
                <span>6+ Channels & Bots</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Official Telegram ecosystem
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs sm:text-sm">
                <Zap className="h-4 w-4" />
                <span>Instant Streaming</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                High-bitrate cloud feeds
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs sm:text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Direct Links</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                Terabox & Cloud direct
              </p>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm">
                <Users className="h-4 w-4" />
                <span>Active Community</span>
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">
                100,000+ member network
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
