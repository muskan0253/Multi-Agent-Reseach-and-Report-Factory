'use client';

import React from 'react';
import { X, Key, Cpu, Sliders, Shield, Info, Palette, Type, Globe } from 'lucide-react';
import { usePreferences, AppTheme, AppFont, AppLanguage } from '../context/PreferencesContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  modelName: string;
  setModelName: (model: string) => void;
  customInstructions: string;
  setCustomInstructions: (inst: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  modelName,
  setModelName,
  customInstructions,
  setCustomInstructions,
}) => {
  const { theme, setTheme, font, setFont, language, setLanguage, t } = usePreferences();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#141C2E] border border-[#E5E7EB] dark:border-[#27354E] rounded-2xl p-6 shadow-2xl space-y-5 text-[#14181F] dark:text-gray-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] dark:border-[#27354E] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F1F2F4] dark:bg-[#1F293D] flex items-center justify-center text-[#14181F] dark:text-gray-100">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#14181F] dark:text-white">
                {t('config')} &amp; Preferences
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-gray-400">Themes, Typography, Multilingual &amp; AI directives</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] hover:text-[#14181F] hover:bg-[#F1F2F4] dark:hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom Appearance Section */}
        <div className="space-y-4 border-b border-[#E5E7EB] dark:border-[#27354E] pb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-gray-400 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#2563EB]" />
            Appearance &amp; Localization
          </h4>

          {/* Theme Selector */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold flex items-center gap-1.5">
              <span>{t('theme')} Mode</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { id: 'liquid-glass', label: '🧊 Liquid Glass', bg: 'bg-[#1C2155]/80 backdrop-blur-md text-white border border-[#8CA0FF]/50 shadow-[0_4px_20px_rgba(123,97,255,0.4)] font-bold' },
                { id: 'claymorphism', label: '🧸 Claymorphism', bg: 'bg-[#818CF8]/30 backdrop-blur-md text-white border border-white/40 shadow-[inset_0_4px_8px_rgba(255,255,255,0.4),0_8px_20px_rgba(0,0,0,0.3)] font-bold' },
                { id: 'synthwave', label: '🌆 Synthwave', bg: 'bg-[#2E0854] text-[#FF71CE] border border-[#FF71CE]/60 shadow-[0_0_15px_rgba(255,113,206,0.3)] font-bold' },
                { id: 'cyberpunk', label: '⚡ Cyberpunk', bg: 'bg-[#0B0C10] text-[#00F0FF] border border-[#FFE600]/80 shadow-[0_0_15px_rgba(0,240,255,0.3)] font-bold' },
                { id: 'light', label: '☀️ Minimal Light', bg: 'bg-white text-gray-800 border-gray-300' },
                { id: 'dark', label: '🌙 Dark Pro', bg: 'bg-[#141C2E] text-white border-blue-900' },
                { id: 'midnight', label: '🌌 Midnight', bg: 'bg-[#030712] text-cyan-300 border-cyan-900' },
                { id: 'sepia', label: '📜 Warm Sepia', bg: 'bg-[#FDFBF7] text-amber-950 border-amber-300' },
              ].map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id as AppTheme)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${th.bg} ${
                    theme === th.id ? 'ring-2 ring-[#2563EB] shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {th.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Selector */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>{t('font')}</span>
            </label>
            <select
              value={font}
              onChange={(e) => setFont(e.target.value as AppFont)}
              className="w-full bg-white dark:bg-[#1E293B] px-3.5 py-2.5 rounded-full border border-[#D1D5DB] dark:border-[#334155] text-xs text-[#14181F] dark:text-white cursor-pointer"
            >
              <option value="inter">Inter (Modern Clean Sans)</option>
              <option value="serif">Georgia / Editorial Serif</option>
              <option value="mono">JetBrains Mono (Technical)</option>
              <option value="lexend">Trebuchet / Sans Soft</option>
              <option value="playfair">Playfair / Classic Academic</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{t('language')}</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="w-full bg-white dark:bg-[#1E293B] px-3.5 py-2.5 rounded-full border border-[#D1D5DB] dark:border-[#334155] text-xs text-[#14181F] dark:text-white cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="zh">中文 (Chinese Simplified)</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
          </div>
        </div>

        {/* AI & Engine Controls */}
        <div className="space-y-4 text-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-gray-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#6366F1]" />
            AI Model &amp; Directives
          </h4>

          {/* API Key */}
          <div className="space-y-1.5">
            <label className="font-semibold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#2563EB]" />
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use built-in intelligent simulation)"
              className="w-full bg-white dark:bg-[#1E293B] px-3.5 py-2.5 rounded-full border border-[#D1D5DB] dark:border-[#334155] focus:border-[#2563EB] focus:outline-none font-mono text-xs text-[#14181F] dark:text-white placeholder-[#9CA3AF]"
            />
            <p className="text-[11px] text-[#6B7280] dark:text-gray-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              Without a key, the factory executes full simulated multi-agent reasoning + live search queries.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#6366F1]" />
              Model Architecture
            </label>
            <select
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full bg-white dark:bg-[#1E293B] px-3.5 py-2.5 rounded-full border border-[#D1D5DB] dark:border-[#334155] text-xs text-[#14181F] dark:text-white cursor-pointer"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultra Fast &amp; Balanced)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning &amp; Complex Analysis)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Next-Gen High Performance)</option>
            </select>
          </div>

          {/* Custom Directives */}
          <div className="space-y-1.5">
            <label className="font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#7C3AED]" />
              Custom Directives &amp; Focus Constraints
            </label>
            <textarea
              rows={3}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Focus heavily on 2025 financial unit economics, prioritize semiconductor manufacturing supply chain bottlenecks, etc."
              className="w-full bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-[#D1D5DB] dark:border-[#334155] focus:border-[#2563EB] focus:outline-none text-xs text-[#14181F] dark:text-white placeholder-[#9CA3AF] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB] dark:border-[#27354E]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#151A17] hover:bg-[#262E29] dark:bg-[#2563EB] dark:hover:bg-[#1D4ED8] text-white rounded-full text-xs font-bold transition-all shadow-xs"
          >
            Save &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
