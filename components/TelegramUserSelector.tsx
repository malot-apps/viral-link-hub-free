'use client';

import React, { useState } from 'react';
import { X, Check, User, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { ITelegramUser } from '@/lib/types';
import { createMockTelegramInitData } from '@/lib/telegram-verify';

interface TelegramUserSelectorProps {
  currentUser: ITelegramUser;
  onSelectUser: (user: ITelegramUser) => void;
  isOpen: boolean;
  onClose: () => void;
  onTriggerPing: () => void;
}

const PRESET_USERS: ITelegramUser[] = [
  {
    id: 108492041,
    first_name: 'Alex',
    last_name: 'Vance',
    username: 'alex_cyber',
    language_code: 'en',
    is_premium: true,
  },
  {
    id: 593810294,
    first_name: 'Elena',
    last_name: 'Rostova',
    username: 'elena_stream',
    language_code: 'ru',
    is_premium: false,
  },
  {
    id: 849201948,
    first_name: 'Marcus',
    username: 'marcus_terabox',
    language_code: 'es',
    is_premium: true,
  },
  {
    id: 992019382,
    first_name: 'Kenji',
    username: 'kenji_tokyo',
    language_code: 'ja',
    is_premium: false,
  },
];

export default function TelegramUserSelector({
  currentUser,
  onSelectUser,
  isOpen,
  onClose,
  onTriggerPing,
}: TelegramUserSelectorProps) {
  const [customId, setCustomId] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim()) return;

    const newUser: ITelegramUser = {
      id: customId.trim(),
      first_name: customName.trim() || `User_${customId.slice(-4)}`,
      username: customName.trim() ? `${customName.toLowerCase().replace(/\s+/g, '_')}` : undefined,
      language_code: 'en',
      is_premium: false,
    };
    onSelectUser(newUser);
    setCustomId('');
    setCustomName('');
    onClose();
  };

  const rawInitData = createMockTelegramInitData(currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#10121a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-zinc-900/60">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[#e50914]" />
            <h3 className="text-sm font-bold text-white">Telegram User Simulation</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-zinc-400">
            Switch simulated Telegram identities to verify how unique user IDs are logged in MongoDB and tracked in real-time analytics.
          </p>

          {/* Current Active Identity */}
          <div className="rounded-lg border border-white/10 bg-zinc-900/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Active Telegram Session
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e50914]/20 text-[#e50914] font-bold">
                  {currentUser.first_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span>{currentUser.first_name} {currentUser.last_name || ''}</span>
                    {currentUser.is_premium && <Sparkles className="h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <div className="font-mono text-xs text-zinc-400">
                    ID: {currentUser.id} {currentUser.username ? `· @${currentUser.username}` : ''}
                  </div>
                </div>
              </div>

              <button
                onClick={onTriggerPing}
                className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-xs text-zinc-200 hover:bg-white/20 active:scale-95 transition-all"
                title="Send active ping"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Ping</span>
              </button>
            </div>
          </div>

          {/* Quick Preset Users */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Preset Test Profiles
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_USERS.map((user) => {
                const isSelected = String(currentUser.id) === String(user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      onSelectUser(user);
                      onClose();
                    }}
                    className={`flex items-center justify-between rounded-lg border p-2.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#e50914] bg-[#e50914]/10 text-white'
                        : 'border-white/5 bg-zinc-900/40 text-zinc-300 hover:border-white/20 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate flex items-center gap-1">
                        {user.first_name}
                        {user.is_premium && <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />}
                      </div>
                      <div className="font-mono text-[10px] text-zinc-500">ID: {user.id}</div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#e50914] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom User Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-2 pt-2 border-t border-white/5">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Custom Telegram ID
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="Telegram User ID (e.g. 71829401)"
                className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-[#e50914] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 active:scale-95"
              >
                Set ID
              </button>
            </div>
          </form>

          {/* Raw InitData Snippet */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Raw Simulated Telegram initData Header
            </div>
            <div className="break-all rounded border border-white/5 bg-black/60 p-2 font-mono text-[10px] text-zinc-400">
              {rawInitData}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
