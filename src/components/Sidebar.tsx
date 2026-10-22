'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  UploadCloud,
} from 'lucide-react';

export type NavView =
  | 'floor'
  | 'planner'
  | 'searcher'
  | 'reader'
  | 'critic'
  | 'report'
  | 'logs';

interface SidebarProps {
  onOpenSettings: () => void;
  onOpenPresets: () => void;
  onOpenLibrary: () => void;
  onOpenUploader: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenSettings,
  onOpenPresets,
  onOpenLibrary,
  onOpenUploader,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      aria-label="Workspace tools"
      className={`hidden md:flex liquid-glass !rounded-none border-r border-[rgba(255,255,255,0.08)] flex-col h-screen sticky top-0 shrink-0 select-none z-20 transition-all duration-200 no-print ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-[rgba(160,190,255,0.2)] flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl liquid-glass-tinted-blue flex items-center justify-center shrink-0 shadow-md">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l-2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>

            <span className="font-bold text-xs text-white tracking-wider uppercase">
              WORKSPACE
            </span>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-xl liquid-glass-tinted-blue flex items-center justify-center shadow-md">
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed((previous) => !previous)}
          className="p-1 rounded-full text-[#9AA8D6] hover:text-white hover:bg-[rgba(160,190,255,0.15)] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Workspace Utility Tools */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        <button
          type="button"
          onClick={onOpenUploader}
          title={isCollapsed ? 'Upload custom files' : undefined}
          aria-label="Upload custom files"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <UploadCloud className="w-4 h-4 text-[#4ADE80] shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-medium truncate">BYOD</span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenLibrary}
          title={isCollapsed ? 'Archive' : undefined}
          aria-label="Open archive"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <Bookmark className="w-4 h-4 text-[#60A5FA] shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-medium truncate">Archive</span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenPresets}
          title={isCollapsed ? 'Presets' : undefined}
          aria-label="Browse research presets"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <Sparkles className="w-4 h-4 text-[#FBBF24] shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-medium truncate">Presets</span>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title={isCollapsed ? 'Configuration' : undefined}
          aria-label="Open configuration"
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'
          } rounded-xl text-[#C5D0F5] hover:text-white hover:bg-[rgba(160,190,255,0.12)] transition-colors`}
        >
          <Sliders className="w-4 h-4 text-[#C5D0F5] shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-medium truncate">Config</span>
          )}
        </button>
      </div>
    </aside>
  );
};
