'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  MessageCircle,
  Bot,
  Shield,
  Bell,
  Sparkles,
  Tv,
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  Radio,
  Users,
  Info,
} from 'lucide-react';
import { ITelegramDestination, ITelegramVerificationResponse, ISettings } from '@/lib/types';
import { INITIAL_TELEGRAM_DESTINATIONS } from '@/lib/catalog-seed';

interface TelegramJoinCardsProps {
  initialDestinations?: ITelegramDestination[];
  isTelegram?: boolean;
  telegramUserId?: string | number | null;
  initData?: string;
  settings?: ISettings;
  highlightRequiredOnly?: boolean;
  onAllRequiredVerified?: () => void;
  className?: string;
  showFilters?: boolean;
}

export default function TelegramJoinCards({
  initialDestinations,
  isTelegram = false,
  telegramUserId,
  initData,
  settings,
  highlightRequiredOnly = false,
  onAllRequiredVerified,
  className = '',
  showFilters = true,
}: TelegramJoinCardsProps) {
  const [destinations, setDestinations] = useState<ITelegramDestination[]>(
    initialDestinations || INITIAL_TELEGRAM_DESTINATIONS
  );
  const [isLoading, setIsLoading] = useState(!initialDestinations);
  const [activeFilter, setActiveFilter] = useState<'all' | 'channel' | 'group' | 'bot' | 'required'>('all');

  // Verification state: destinationId -> ITelegramVerificationResponse & loading state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationMap, setVerificationMap] = useState<Record<string, ITelegramVerificationResponse>>({});

  // Fetch from public API on mount if not preloaded
  useEffect(() => {
    let isMounted = true;
    const loadDestinations = async () => {
      try {
        const platform = isTelegram ? 'miniapp' : 'website';
        const res = await fetch(`/api/v1/telegram/destinations?platform=${platform}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0 && isMounted) {
          setDestinations(data.data);
        }
      } catch (err) {
        console.warn('[TelegramJoinCards load error]:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDestinations();
    return () => {
      isMounted = false;
    };
  }, [isTelegram]);

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    let list = [...destinations];

    if (highlightRequiredOnly) {
      list = list.filter((d) => d.isRequired);
    } else if (activeFilter === 'required') {
      list = list.filter((d) => d.isRequired);
    } else if (activeFilter !== 'all') {
      list = list.filter((d) => d.type === activeFilter);
    }

    // Secondary platform filter if not already filtered
    if (isTelegram) {
      list = list.filter((d) => d.showOnMiniapp !== false);
    } else {
      list = list.filter((d) => d.showOnWebsite !== false);
    }

    return list.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [destinations, activeFilter, highlightRequiredOnly, isTelegram]);

  // Check if all required destinations have been verified
  useEffect(() => {
    const requiredItems = destinations.filter((d) => d.isRequired && (isTelegram ? d.showOnMiniapp : d.showOnWebsite));
    if (requiredItems.length > 0) {
      const allDone = requiredItems.every((d) => verificationMap[d.id]?.verified);
      if (allDone && onAllRequiredVerified) {
        onAllRequiredVerified();
      }
    }
  }, [verificationMap, destinations, isTelegram, onAllRequiredVerified]);

  // Open destination in Telegram
  const handleOpenDestination = (destination: ITelegramDestination) => {
    const url = destination.url;
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      try {
        window.Telegram.WebApp.openTelegramLink(url);
        return;
      } catch {
        // fallback to window.open or window.location
      }
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Perform server-side Telegram Bot API verification
  const handleVerifyMembership = async (destination: ITelegramDestination) => {
    setVerifyingId(destination.id);

    try {
      const payload: Record<string, any> = {
        destinationId: destination.id,
        chatId: destination.chatId || destination.username,
      };

      if (telegramUserId) {
        payload.userId = telegramUserId;
      }
      if (initData) {
        payload.initData = initData;
      }

      // If user ID still unknown (e.g. standard browser), prompt user for their Telegram ID
      if (!payload.userId && !payload.initData) {
        const manualId = window.prompt(
          'Please enter your numeric Telegram User ID to verify channel membership (e.g., from @userinfobot):'
        );
        if (!manualId || !manualId.trim()) {
          setVerifyingId(null);
          return;
        }
        payload.userId = manualId.trim();
      }

      const res = await fetch('/api/v1/telegram/verify-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setVerificationMap((prev) => ({
          ...prev,
          [destination.id]: data.data,
        }));
      } else {
        setVerificationMap((prev) => ({
          ...prev,
          [destination.id]: {
            verified: false,
            status: 'error',
            serverVerified: false,
            message: data.error || 'Server could not complete verification.',
            destinationId: destination.id,
          },
        }));
      }
    } catch (err: any) {
      setVerificationMap((prev) => ({
        ...prev,
        [destination.id]: {
          verified: false,
          status: 'error',
          serverVerified: false,
          message: `Network error: ${err?.message || 'Could not reach server'}`,
          destinationId: destination.id,
        },
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  // Icon renderer helper
  const renderIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'bell':
        return <Bell className="h-5 w-5 text-sky-400" />;
      case 'message-circle':
        return <MessageCircle className="h-5 w-5 text-purple-400" />;
      case 'bot':
        return <Bot className="h-5 w-5 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="h-5 w-5 text-pink-400" />;
      case 'shield':
        return <Shield className="h-5 w-5 text-amber-400" />;
      case 'tv':
        return <Tv className="h-5 w-5 text-indigo-400" />;
      case 'star':
        return <Star className="h-5 w-5 text-yellow-400" />;
      default:
        return <Send className="h-5 w-5 text-sky-400" />;
    }
  };

  const sectionTitle = settings?.communitySectionTitle || 'Official Telegram Ecosystem';
  const sectionSubtitle =
    settings?.communitySectionSubtitle ||
    'Join our verified channels, discussion groups, and interactive bots for direct links and member-only updates';

  return (
    <section id="telegram-destinations" className={`relative py-8 sm:py-12 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>Verified Telegram Hub</span>
            </div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {sectionTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-400 max-w-2xl">
              {sectionSubtitle}
            </p>
          </div>

          {/* Filter Pills */}
          {showFilters && !highlightRequiredOnly && (
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto rounded-xl border border-white/5 bg-[#0f121d] p-1 text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-sky-500/20 text-sky-400 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({destinations.length})
              </button>
              <button
                onClick={() => setActiveFilter('channel')}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  activeFilter === 'channel'
                    ? 'bg-sky-500/20 text-sky-400 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Channels
              </button>
              <button
                onClick={() => setActiveFilter('group')}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  activeFilter === 'group'
                    ? 'bg-purple-500/20 text-purple-400 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveFilter('bot')}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  activeFilter === 'bot'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Bots
              </button>
              <button
                onClick={() => setActiveFilter('required')}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  activeFilter === 'required'
                    ? 'bg-amber-500/20 text-amber-400 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Required Only
              </button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-2xl border border-white/5 bg-white/[0.02] p-5 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Cards Grid */}
        {!isLoading && filteredDestinations.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <Send className="mx-auto h-8 w-8 text-zinc-500" />
            <p className="mt-2 text-sm text-zinc-400">No destinations match this filter.</p>
          </div>
        )}

        {!isLoading && filteredDestinations.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((dest) => {
              const verification = verificationMap[dest.id];
              const isChecking = verifyingId === dest.id;
              const isVerified = verification?.verified === true;

              return (
                <div
                  key={dest.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                    isVerified
                      ? 'border-emerald-500/30 bg-emerald-950/10 shadow-lg shadow-emerald-950/20'
                      : dest.isRequired
                      ? 'border-amber-500/20 bg-gradient-to-b from-[#141522] to-[#0c0e17] hover:border-amber-500/40'
                      : 'border-white/5 bg-[#0f121d]/90 hover:border-white/15'
                  }`}
                >
                  {/* Top Row: Icon + Badges */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner">
                        {renderIcon(dest.icon)}
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px]">
                        {/* Type Badge */}
                        <span
                          className={`rounded-md px-2 py-0.5 font-semibold capitalize ${
                            dest.type === 'channel'
                              ? 'bg-sky-500/15 text-sky-400'
                              : dest.type === 'group'
                              ? 'bg-purple-500/15 text-purple-400'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {dest.type}
                        </span>

                        {/* Required vs Optional */}
                        {dest.isRequired ? (
                          <span className="flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 font-bold text-amber-400">
                            <Lock className="h-3 w-3" />
                            <span>Required</span>
                          </span>
                        ) : (
                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-zinc-400">
                            Optional
                          </span>
                        )}

                        {/* Verified Status Pill */}
                        {isVerified && (
                          <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 font-bold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Destination Title & Username */}
                    <div className="mt-3.5">
                      <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                        {dest.title}
                      </h3>
                      {dest.username && (
                        <p className="text-xs font-mono text-zinc-400">
                          {dest.username.startsWith('@') ? dest.username : `@${dest.username}`}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-2 text-xs text-zinc-300 leading-relaxed line-clamp-2">
                      {dest.description}
                    </p>

                    {/* Member Count & Status */}
                    {dest.memberCountDisplay && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{dest.memberCountDisplay}</span>
                      </div>
                    )}

                    {/* Verification Feedback Banner */}
                    {verification && (
                      <div
                        className={`mt-3 rounded-lg border p-2 text-xs leading-tight ${
                          verification.verified
                            ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                            : verification.status === 'manual_required'
                            ? 'border-sky-500/30 bg-sky-950/30 text-sky-300'
                            : 'border-amber-500/30 bg-amber-950/30 text-amber-300'
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          {verification.verified ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                          ) : (
                            <Info className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                          )}
                          <span>{verification.message}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/5">
                    {/* Direct Join Button */}
                    <button
                      onClick={() => handleOpenDestination(dest)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#0099e6] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{dest.type === 'bot' ? 'Start Bot' : 'Join'}</span>
                      <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
                    </button>

                    {/* Server Verification Check Button */}
                    {dest.type !== 'bot' && (
                      <button
                        onClick={() => handleVerifyMembership(dest)}
                        disabled={isChecking || isVerified}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                          isVerified
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default'
                            : isChecking
                            ? 'border-white/10 bg-white/5 text-zinc-400 cursor-wait'
                            : 'border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white'
                        }`}
                        title="Verify server-side via Telegram Bot API"
                      >
                        {isChecking ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
                        ) : isVerified ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Shield className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                        <span>{isChecking ? 'Checking...' : isVerified ? 'Verified' : 'Verify'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
