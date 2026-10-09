'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Radio,
  ExternalLink,
  Shield,
  Bot,
  MessageCircle,
  Bell,
  Sparkles,
  Tv,
  Star,
  Globe,
  Smartphone,
  Check,
  X,
} from 'lucide-react';
import { ITelegramDestination, TelegramDestinationType } from '@/lib/types';
import { isValidTelegramUrl } from '@/lib/security';

interface AdminDestinationsTabProps {
  appMode?: 'production' | 'demo';
}

const ICON_OPTIONS = [
  { value: 'send', label: 'Send / Paper Plane', icon: Send },
  { value: 'bell', label: 'Bell / Announcement', icon: Bell },
  { value: 'message-circle', label: 'Message Circle / Community', icon: MessageCircle },
  { value: 'bot', label: 'Bot / Automation', icon: Bot },
  { value: 'sparkles', label: 'Sparkles / Exclusive', icon: Sparkles },
  { value: 'shield', label: 'Shield / Security', icon: Shield },
  { value: 'tv', label: 'TV / Media Stream', icon: Tv },
  { value: 'star', label: 'Star / VIP Star', icon: Star },
];

export default function AdminDestinationsTab({ appMode = 'production' }: AdminDestinationsTabProps) {
  const [destinations, setDestinations] = useState<ITelegramDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmDest, setDeleteConfirmDest] = useState<ITelegramDestination | null>(null);

  // Form state
  const [form, setForm] = useState<{
    title: string;
    description: string;
    type: TelegramDestinationType;
    url: string;
    username: string;
    chatId: string;
    icon: string;
    isRequired: boolean;
    showOnWebsite: boolean;
    showOnMiniapp: boolean;
    orderIndex: number;
    isActive: boolean;
    memberCountDisplay: string;
  }>({
    title: '',
    description: '',
    type: 'channel',
    url: '',
    username: '',
    chatId: '',
    icon: 'send',
    isRequired: false,
    showOnWebsite: true,
    showOnMiniapp: true,
    orderIndex: 1,
    isActive: true,
    memberCountDisplay: '',
  });

  // Verification Test Tool state
  const [testChatId, setTestChatId] = useState('');
  const [testUserId, setTestUserId] = useState('');
  const [isTestingVerification, setIsTestingVerification] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchDestinations = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/v1/admin/destinations');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDestinations(data.data);
      } else {
        setErrorMsg(data.error || 'Failed to load destinations');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error loading destinations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      type: 'channel',
      url: 'https://t.me/',
      username: '@',
      chatId: '',
      icon: 'send',
      isRequired: false,
      showOnWebsite: true,
      showOnMiniapp: true,
      orderIndex: destinations.length + 1,
      isActive: true,
      memberCountDisplay: '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (dest: ITelegramDestination) => {
    setEditingId(dest.id);
    setForm({
      title: dest.title,
      description: dest.description || '',
      type: dest.type,
      url: dest.url,
      username: dest.username || '',
      chatId: dest.chatId || '',
      icon: dest.icon || 'send',
      isRequired: Boolean(dest.isRequired),
      showOnWebsite: dest.showOnWebsite !== false,
      showOnMiniapp: dest.showOnMiniapp !== false,
      orderIndex: dest.orderIndex ?? 0,
      isActive: dest.isActive !== false,
      memberCountDisplay: dest.memberCountDisplay || '',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  // Save Destination (Create or Update)
  const handleSaveDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.title.trim()) {
      setErrorMsg('Title is required');
      return;
    }

    if (!form.url.trim() || !isValidTelegramUrl(form.url)) {
      setErrorMsg('Please enter a valid Telegram URL (e.g. https://t.me/channel_name)');
      return;
    }

    setIsSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId
        ? `/api/v1/admin/destinations/${editingId}`
        : '/api/v1/admin/destinations';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setSuccessMsg(editingId ? 'Destination updated successfully' : 'Destination created successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
        await fetchDestinations();
      } else {
        setErrorMsg(data.error || 'Failed to save destination');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error saving destination');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick toggle active state
  const handleToggleActive = async (dest: ITelegramDestination) => {
    try {
      const res = await fetch(`/api/v1/admin/destinations/${dest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !dest.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setDestinations((prev) =>
          prev.map((d) => (d.id === dest.id ? { ...d, isActive: !d.isActive } : d))
        );
      }
    } catch {
      // non-fatal
    }
  };

  // Delete Destination
  const handleDeleteDestination = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/destinations/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirmDest(null);
        setDestinations((prev) => prev.filter((d) => d.id !== id));
        setSuccessMsg('Destination deleted successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to delete destination');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error deleting destination');
    }
  };

  // Move up or down in order
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= destinations.length) return;

    const reordered = [...destinations];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((d) => d.id);
    setDestinations(reordered);

    try {
      await fetch('/api/v1/admin/destinations/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      });
    } catch {
      // non-fatal
    }
  };

  // Test Verification Tool
  const handleRunVerificationTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChatId.trim() || !testUserId.trim()) return;

    setIsTestingVerification(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/v1/telegram/verify-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId.trim(),
          userId: testUserId.trim(),
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTestingVerification(false);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'bell':
        return <Bell className="h-4 w-4 text-sky-400" />;
      case 'message-circle':
        return <MessageCircle className="h-4 w-4 text-purple-400" />;
      case 'bot':
        return <Bot className="h-4 w-4 text-emerald-400" />;
      case 'sparkles':
        return <Sparkles className="h-4 w-4 text-pink-400" />;
      case 'shield':
        return <Shield className="h-4 w-4 text-amber-400" />;
      case 'tv':
        return <Tv className="h-4 w-4 text-indigo-400" />;
      case 'star':
        return <Star className="h-4 w-4 text-yellow-400" />;
      default:
        return <Send className="h-4 w-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-white/5 bg-[#0f121d] p-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Multi-Destination Hub</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Telegram Destination Manager
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage official channels, discussion groups, and interactive bots displayed on Website and Telegram Mini App.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDestinations}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#0099e6] px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-950/30 p-3 text-xs font-medium text-rose-300">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Destinations List */}
      <div className="space-y-3">
        {isLoading && destinations.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#0f121d] p-12 text-center">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-sky-400" />
            <p className="mt-2 text-xs text-zinc-400">Loading Telegram destinations from database...</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f121d]/50 p-12 text-center">
            <Send className="mx-auto h-8 w-8 text-zinc-500" />
            <p className="mt-2 text-sm text-zinc-300">No destinations configured yet.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Destination</span>
            </button>
          </div>
        ) : (
          destinations.map((dest, index) => (
            <div
              key={dest.id}
              className={`flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-4 transition-colors ${
                dest.isActive
                  ? 'border-white/5 bg-[#0f121d]'
                  : 'border-white/5 bg-[#0b0d14]/70 opacity-60'
              }`}
            >
              {/* Left Column: Reorder + Icon + Info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Reorder Up/Down */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20"
                    title="Move Up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => handleMoveOrder(index, 'down')}
                    disabled={index === destinations.length - 1}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20"
                    title="Move Down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Icon box */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-inner">
                  {renderIcon(dest.icon)}
                </div>

                {/* Title and details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                      {dest.title}
                    </h3>

                    {/* Type Badge */}
                    <span
                      className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${
                        dest.type === 'channel'
                          ? 'bg-sky-500/15 text-sky-400'
                          : dest.type === 'group'
                          ? 'bg-purple-500/15 text-purple-400'
                          : 'bg-emerald-500/15 text-emerald-400'
                      }`}
                    >
                      {dest.type}
                    </span>

                    {/* Required Badge */}
                    {dest.isRequired ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold rounded bg-amber-500/15 text-amber-400 px-1.5 py-0.5">
                        <Lock className="h-2.5 w-2.5" />
                        <span>Required</span>
                      </span>
                    ) : (
                      <span className="text-[10px] rounded bg-white/5 text-zinc-400 px-1.5 py-0.5">
                        Optional
                      </span>
                    )}

                    {/* Active status */}
                    {!dest.isActive && (
                      <span className="text-[10px] rounded bg-rose-500/15 text-rose-400 px-1.5 py-0.5 font-semibold">
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* URL, username, chat ID */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                    {dest.username && (
                      <span className="font-mono text-zinc-300">
                        {dest.username.startsWith('@') ? dest.username : `@${dest.username}`}
                      </span>
                    )}
                    {dest.chatId && (
                      <span className="font-mono text-[11px] text-zinc-400">
                        ID: {dest.chatId}
                      </span>
                    )}
                    {dest.memberCountDisplay && (
                      <span className="text-emerald-400 text-[11px]">
                        • {dest.memberCountDisplay}
                      </span>
                    )}
                    <a
                      href={dest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Platform Visibility + Actions */}
              <div className="flex flex-wrap items-center gap-2 self-end md:self-auto shrink-0">
                {/* Visibility Badges */}
                <div className="flex items-center gap-1 text-[11px] mr-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 border ${
                      dest.showOnWebsite
                        ? 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400'
                        : 'border-white/5 bg-white/[0.02] text-zinc-400'
                    }`}
                    title="Website Visibility"
                  >
                    <Globe className="h-3 w-3" />
                    <span>Web</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 border ${
                      dest.showOnMiniapp
                        ? 'border-sky-500/20 bg-sky-950/20 text-sky-400'
                        : 'border-white/5 bg-white/[0.02] text-zinc-400'
                    }`}
                    title="Telegram Mini App Visibility"
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>MiniApp</span>
                  </span>
                </div>

                {/* Quick Toggle Active */}
                <button
                  onClick={() => handleToggleActive(dest)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                    dest.isActive
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                  title={dest.isActive ? 'Click to disable' : 'Click to enable'}
                >
                  {dest.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(dest)}
                  className="p-2 rounded-xl border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 hover:text-white"
                  title="Edit Destination"
                >
                  <Edit2 className="h-4 w-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirmDest(dest)}
                  className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                  title="Delete Destination"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live Telegram Verification Tester Section */}
      <div className="rounded-2xl border border-white/5 bg-[#0f121d] p-5 mt-8">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">
            Server-Side Telegram Bot API Verification Tester
          </h3>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Test real-time channel or group membership checks using the server Telegram Bot API (<code className="font-mono text-zinc-300">getChatMember</code>). Bot must be an administrator in the target channel or group.
        </p>

        <form onSubmit={handleRunVerificationTest} className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Channel / Group @username or -100 ID"
            value={testChatId}
            onChange={(e) => setTestChatId(e.target.value)}
            className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
          />
          <input
            type="text"
            placeholder="Numeric Telegram User ID"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            className="w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={isTestingVerification || !testChatId || !testUserId}
            className="flex items-center gap-1.5 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 hover:bg-sky-600"
          >
            {isTestingVerification ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            <span>Test Membership</span>
          </button>
        </form>

        {testResult && (
          <div
            className={`mt-4 rounded-xl border p-3 text-xs font-mono leading-relaxed ${
              testResult.data?.verified
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {testResult.data?.verified ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-400" />
              )}
              <span>
                Verified: {String(testResult.data?.verified)} (Status: {testResult.data?.status || 'error'})
              </span>
            </div>
            <p className="mt-1 text-zinc-300">
              Message: {testResult.data?.message || testResult.error || 'No message returned'}
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0c0e17] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingId ? 'Edit Telegram Destination' : 'Add Telegram Destination'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="mt-4 space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Destination Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Viral Link Hub · Official Announcements"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Type & Icon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Destination Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full rounded-xl border border-white/10 bg-[#161a29] px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="channel">Channel (Broadcast)</option>
                    <option value="group">Group (Community Chat)</option>
                    <option value="bot">Bot (Interactive / Utility)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Display Icon *
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#161a29] px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Telegram Destination URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://t.me/your_channel_or_bot"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
                />
                <p className="mt-1 text-[11px] text-zinc-400">
                  Must be a valid Telegram URL (https://t.me/... or tg://...)
                </p>
              </div>

              {/* Username & Chat ID */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Username / Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@channel_name"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Chat ID for Bot API Verification
                  </label>
                  <input
                    type="text"
                    placeholder="@channel or -100..."
                    value={form.chatId}
                    onChange={(e) => setForm({ ...form, chatId: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Daily releases, cloud streams & VIP links."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {/* Member Count & Order Index */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Member Count Display Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 54.2K members or Active 24/7"
                    value={form.memberCountDisplay}
                    onChange={(e) => setForm({ ...form, memberCountDisplay: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.orderIndex}
                    onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Toggles Strip */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-2.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-zinc-300 font-medium">Active (Enabled)</span>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 text-sky-500 focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-zinc-300 font-medium">Required to Join</span>
                    <p className="text-[10px] text-zinc-400">Must be joined to pass content verification / VIP unlocks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isRequired}
                    onChange={(e) => setForm({ ...form, isRequired: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-zinc-300 font-medium">Show on Website</span>
                    <p className="text-[10px] text-zinc-400">Display card on desktop and mobile web</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.showOnWebsite}
                    onChange={(e) => setForm({ ...form, showOnWebsite: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 text-sky-500 focus:ring-sky-500"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-zinc-300 font-medium">Show on Telegram Mini App</span>
                    <p className="text-[10px] text-zinc-400">Display card inside Telegram WebApp environment</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.showOnMiniapp}
                    onChange={(e) => setForm({ ...form, showOnMiniapp: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-700 text-sky-500 focus:ring-sky-500"
                  />
                </label>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-500/20 bg-rose-950/30 p-2.5 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#0099e6] px-5 py-2 font-bold text-white disabled:opacity-40 hover:brightness-110"
                >
                  {isSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{editingId ? 'Save Changes' : 'Create Destination'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/20 bg-[#0c0e17] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete Destination</span>
            </div>
            <p className="mt-2 text-xs text-zinc-300">
              Are you sure you want to delete <span className="font-bold text-white">{deleteConfirmDest.title}</span>? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmDest(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDestination(deleteConfirmDest.id)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
