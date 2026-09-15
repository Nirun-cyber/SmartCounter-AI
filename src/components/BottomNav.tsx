import { FC } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Sparkles,
  Boxes,
  MoreHorizontal,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  lowStockCount: number;
  onOpenMoreMenu: () => void;
}

export const BottomNav: FC<BottomNavProps> = ({
  activeTab,
  onNavigate,
  lowStockCount,
  onOpenMoreMenu,
}) => {
  const isMoreTab = ['sales-history', 'analytics', 'settings'].includes(activeTab);

  return (
    <nav
      id="mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-stone-200 bg-white/95 px-2 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/95 lg:hidden"
    >
      {/* Dashboard */}
      <button
        id="bottom-nav-dashboard"
        onClick={() => onNavigate('dashboard')}
        className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition ${
          activeTab === 'dashboard'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
        }`}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span className="text-[10px]">Overview</span>
      </button>

      {/* Stock */}
      <button
        id="bottom-nav-products"
        onClick={() => onNavigate('products')}
        className={`relative flex min-h-[44px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition ${
          activeTab === 'products'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
        }`}
      >
        <div className="relative">
          <Boxes className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
              {lowStockCount}
            </span>
          )}
        </div>
        <span className="text-[10px]">Stock</span>
      </button>

      {/* Center Action: New Bill */}
      <button
        id="bottom-nav-new-bill"
        onClick={() => onNavigate('new-bill')}
        className="flex min-h-[44px] min-w-[48px] -translate-y-2 flex-col items-center justify-center"
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-md transition active:scale-95 ${
            activeTab === 'new-bill'
              ? 'bg-indigo-600 text-white shadow-indigo-300 dark:bg-indigo-500 dark:shadow-none'
              : 'bg-indigo-600 text-white shadow-stone-300 dark:bg-indigo-500 dark:shadow-none'
          }`}
        >
          <Receipt className="h-6 w-6" />
        </div>
        <span className="mt-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
          Bill
        </span>
      </button>

      {/* AI Order */}
      <button
        id="bottom-nav-ai-order"
        onClick={() => onNavigate('ai-order')}
        className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition ${
          activeTab === 'ai-order'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
        }`}
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-[10px]">AI Voice</span>
      </button>

      {/* More Options */}
      <button
        id="bottom-nav-more"
        onClick={onOpenMoreMenu}
        className={`flex min-h-[44px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-medium transition ${
          isMoreTab
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-stone-500 hover:text-stone-900 dark:text-stone-400'
        }`}
      >
        <MoreHorizontal className="h-5 w-5" />
        <span className="text-[10px]">More</span>
      </button>
    </nav>
  );
};
