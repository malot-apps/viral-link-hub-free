'use client';

import React from 'react';
import { Wrench, Shield, ArrowRight } from 'lucide-react';

interface MaintenanceScreenProps {
  appName: string;
  onOpenAdmin: () => void;
  onBypass: () => void;
}

export default function MaintenanceScreen({
  appName,
  onOpenAdmin,
  onBypass,
}: MaintenanceScreenProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur-md shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Wrench className="h-8 w-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
            {appName} Maintenance
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Our cloud Terabox distribution network is undergoing scheduled CDN node optimization. We will be back online shortly!
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={onBypass}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 active:scale-95"
          >
            <span>Preview Mode (Bypass Notice)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onOpenAdmin}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-xs text-zinc-400 hover:text-white"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Admin Control Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
