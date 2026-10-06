import { FC } from 'react';
import {
  LayoutDashboard,
  Receipt,
  Boxes,
  Sparkles,
  History,
  BarChart3,
  Settings,
  User,
  Zap,
  Award,
} from 'lucide-react';
import { ActiveTab, ShopSettings } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  lowStockCount: number;
  settings: ShopSettings;
}

export const Sidebar: FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  lowStockCount,
  settings,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'new-bill' as ActiveTab,
      label: 'New Bill',
      icon: Receipt,
      isPrimary: true,
      badge: 'Fast',
    },
    {
      id: 'ai-order' as ActiveTab,
      label: 'AI Order Entry',
      icon: Sparkles,
      badge: 'Voice',
    },
    {
      id: 'products' as ActiveTab,
      label: 'Products / Stock',
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount}` : null,
      badgeType: lowStockCount > 0 ? 'warning' : 'neutral',
    },
    {
      id: 'sales-history' as ActiveTab,
      label: 'Sales History',
      icon: History,
      badge: null,
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
    {
      id: 'review1' as ActiveTab,
      label: 'Review 1 Dossier',
      icon: Award,
      badge: '45%',
      badgeType: 'success',
    },
  ];

  return (
    <aside
      id="desktop-sidebar"
      className="hidden w-64 flex-shrink-0 flex-col border-r border-stone-200 bg-stone-50/70 p-4 transition-colors dark:border-stone-800 dark:bg-stone-900/60 lg:flex"
    >
      {/* Navigation List */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isPrimary) {
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`group mb-3 flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold shadow-sm transition active:scale-[0.98] ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-indigo-200 dark:bg-indigo-500 dark:shadow-none'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-indigo-600 text-white dark:bg-indigo-500'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-indigo-200/70 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-stone-800 dark:text-indigo-400'
                  : 'text-stone-600 hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/60 dark:hover:text-stone-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-stone-400 dark:text-stone-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    item.badgeType === 'warning'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : item.badgeType === 'success'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Speed Tip Box */}
      <div className="mb-4 rounded-xl border border-stone-200 bg-white p-3 shadow-xs dark:border-stone-800 dark:bg-stone-800/80">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>Counter Tip</span>
        </div>
        <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400">
          Ask customers for multiple items at once. Press 🎤 to let AI sort rack
          locations instantly!
        </p>
      </div>

      {/* Shopkeeper Profile */}
      <div className="flex items-center gap-3 rounded-xl border border-stone-200/80 bg-white/60 p-2.5 dark:border-stone-800 dark:bg-stone-800/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">
          <User className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-stone-800 dark:text-stone-200">
            {settings.shopkeeperName}
          </p>
          <p className="truncate text-[11px] text-stone-400 dark:text-stone-500">
            Counter In-Charge
          </p>
        </div>
      </div>
    </aside>
  );
};
