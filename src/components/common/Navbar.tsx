import React from "react";
import { QrCode, ScanLine, Layers, History, Settings, ShieldCheck, Sun, Moon } from "lucide-react";

export type NavTab = "scan" | "image" | "batch" | "generate" | "history" | "settings";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isDark, setIsDark }) => {
  const tabs = [
    { id: "scan", label: "Live Camera", icon: ScanLine },
    { id: "image", label: "Image / Drop", icon: QrCode },
    { id: "batch", label: "Batch Scan", icon: Layers },
    { id: "generate", label: "QR Studio", icon: QrCode },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 shadow-inner">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">ScanDesk</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                Offline Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Private QR & Barcode Intelligence</p>
          </div>
        </div>

        {/* Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as NavTab)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400/80 bg-emerald-500/5 px-2.5 py-1 rounded-md border border-emerald-500/10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero Telemetry</span>
          </div>

          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-lg p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/60 bg-slate-950 px-2 py-1.5 gap-1 scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as NavTab)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isActive ? "bg-emerald-500 text-slate-950 font-semibold" : "text-slate-400 hover:bg-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
