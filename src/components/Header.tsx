import { FC } from 'react';
import {
  Sparkles,
  MapPin,
  Moon,
  Sun,
  AlertTriangle,
  Store,
  Receipt,
  Cpu,
} from 'lucide-react';
import { ShopSettings } from '../types';

interface HeaderProps {
  settings: ShopSettings;
  activeTab: string;
  lowStockCount: number;
  isAiDemoMode: boolean;
  onNavigate: (tab: any) => void;
  onOpenFindProduct: () => void;
  onToggleTheme: () => void;
}

export const Header: FC<HeaderProps> = ({
  settings,
  activeTab,
  lowStockCount,
  isAiDemoMode,
  onNavigate,
  onOpenFindProduct,
  onToggleTheme,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Store Overview';
      case 'new-bill':
        return 'Counter Billing';
      case 'products':
        return 'Inventory & Stock';
      case 'ai-order':
        return 'AI Natural Order Entry';
      case 'sales-history':
        return 'Sales & Invoices';
      case 'analytics':
        return 'Sales Analytics';
      case 'settings':
        return 'Shop Settings';
      default:
        return 'SmartCounter AI';
    }
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md transition-colors dark:border-stone-800 dark:bg-stone-900/95 sm:px-6"
    >
      {/* Left: Brand & Page Context */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-black text-white shadow-sm shadow-indigo-200 dark:bg-indigo-500 dark:shadow-none">
          <Store className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-stone-900 dark:text-white">
              SMARTCOUNTER <span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
            <span className="hidden rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300 md:inline-block">
              {settings.shopName}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {getTabTitle()}
          </p>
        </div>
      </div>

      {/* Right: Quick Tools & Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Status Pill */}
        <div
          id="header-ai-status"
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            isAiDemoMode
              ? 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
          }`}
          title={
            isAiDemoMode
              ? 'Demo Mode: Simulated NLP Parsing & local catalog matching active'
              : 'Connected: Gemini 3.8 Flash live order extraction'
          }
        >
          {isAiDemoMode ? (
            <>
              <Cpu className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">AI: Demo Mode</span>
              <span className="sm:hidden">Demo</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Gemini 3.8 Flash</span>
              <span className="sm:hidden">Gemini</span>
            </>
          )}
        </div>

        {/* Low Stock Warning Pill */}
        {lowStockCount > 0 && (
          <button
            id="header-low-stock-alert"
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60"
            title={`${lowStockCount} products need restocking`}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{lowStockCount}</span>
            <span className="hidden md:inline">Low Stock</span>
          </button>
        )}

        {/* Find Location Quick Button */}
        <button
          id="header-find-location-btn"
          onClick={onOpenFindProduct}
          className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-indigo-600 dark:hover:bg-stone-700"
          title="Find product shelf/rack location immediately"
        >
          <MapPin className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Find Shelf</span>
        </button>

        {/* Quick New Bill Button */}
        <button
          id="header-quick-bill-btn"
          onClick={() => onNavigate('new-bill')}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Receipt className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">New Bill</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="header-theme-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {settings.theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-stone-600" />
          )}
        </button>
      </div>
    </header>
  );
};
