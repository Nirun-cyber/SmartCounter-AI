import { FC } from 'react';
import {
  TrendingUp,
  Receipt,
  Boxes,
  AlertTriangle,
  Plus,
  Mic,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  PackageCheck,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { Product, ShopSettings, Transaction } from '../types';

interface DashboardPageProps {
  products: Product[];
  transactions: Transaction[];
  settings: ShopSettings;
  onNavigate: (tab: any) => void;
  onSelectProduct: (product: Product) => void;
  onSelectTransaction: (transaction: Transaction) => void;
  onOpenAddStock: (product: Product) => void;
  onOpenStoreMap?: () => void;
}

export const DashboardPage: FC<DashboardPageProps> = ({
  products,
  transactions,
  settings,
  onNavigate,
  onSelectProduct,
  onSelectTransaction,
  onOpenAddStock,
  onOpenStoreMap,
}) => {
  // Compute today's metrics
  const now = new Date();
  const todayDateStr = now.toISOString().split('T')[0];

  const todayTransactions = transactions.filter((t) =>
    t.timestamp.startsWith(todayDateStr)
  );

  const todaySales = todayTransactions.reduce((sum, t) => sum + t.grandTotal, 0);
  const billsTodayCount = todayTransactions.length;
  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  );

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div id="dashboard-page" className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Counter Overview
          </h1>
          <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
            Welcome back, <b className="text-stone-800 dark:text-stone-200">{settings.shopkeeperName}</b> • Fast billing & stock monitor
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dash-action-new-bill"
            onClick={() => onNavigate('new-bill')}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Bill</span>
          </button>

          <button
            id="dash-action-ai-order"
            onClick={() => onNavigate('ai-order')}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900"
          >
            <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>🎤 AI Order</span>
          </button>

          <button
            id="dash-action-stock"
            onClick={() => onNavigate('products')}
            className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <Boxes className="h-4 w-4 text-stone-500" />
            <span>📦 Stock</span>
          </button>

          {onOpenStoreMap && (
            <button
              id="dash-action-store-map"
              onClick={onOpenStoreMap}
              className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              title="View 2D Store Rack Layout & Pathfinder"
            >
              <span>🗺️ Store Map</span>
            </button>
          )}

          <button
            id="dash-action-review1"
            onClick={() => onNavigate('review1')}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3.5 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900"
          >
            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Review 1 (45%)</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Today's Sales */}
        <div
          id="stat-today-sales"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-indigo-200 dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Today's Sales
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            {settings.currencySymbol}
            {todaySales.toLocaleString('en-IN')}
          </div>
          <p className="mt-1 text-[11px] text-stone-400">
            Across {billsTodayCount} settled bills today
          </p>
        </div>

        {/* Bills Today */}
        <div
          id="stat-today-bills"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-indigo-200 dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Bills Today
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            {billsTodayCount}
          </div>
          <p className="mt-1 text-[11px] text-stone-400">
            Avg value: {settings.currencySymbol}
            {billsTodayCount > 0 ? Math.round(todaySales / billsTodayCount) : 0}
          </p>
        </div>

        {/* Total Products */}
        <div
          id="stat-total-products"
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs transition hover:border-indigo-200 dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Total Products
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            {totalProducts}
          </div>
          <p className="mt-1 text-[11px] text-stone-400">
            Across 8 shelf rack zones
          </p>
        </div>

        {/* Low Stock Items */}
        <div
          id="stat-low-stock"
          onClick={() => onNavigate('products')}
          className="cursor-pointer rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs transition hover:bg-rose-100/50 dark:border-rose-900/60 dark:bg-rose-950/30 dark:hover:bg-rose-950/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Low Stock Items
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black tracking-tight text-rose-700 dark:text-rose-300 sm:text-3xl">
            {lowStockProducts.length}
          </div>
          <p className="mt-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            Needs replenishment →
          </p>
        </div>
      </div>

      {/* Main 2-Column Split: Recent Bills & Low Stock Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bills */}
        <div
          id="dash-recent-bills-card"
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Recent Bills
              </h2>
            </div>
            <button
              onClick={() => onNavigate('sales-history')}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {recentTransactions.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-400">
                No bills generated yet today.
              </p>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  id={`recent-bill-${tx.id}`}
                  onClick={() => onSelectTransaction(tx)}
                  className="group flex cursor-pointer items-center justify-between py-3 transition hover:bg-stone-50/80 -mx-2 px-2 rounded-xl dark:hover:bg-stone-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:bg-stone-800 dark:text-stone-300 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900 dark:text-white">
                          Bill #{tx.billNumber}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            tx.paymentMethod === 'UPI'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {tx.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400">
                        {tx.items.length} item{tx.items.length > 1 ? 's' : ''} •{' '}
                        {new Date(tx.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-stone-900 dark:text-white">
                      {settings.currencySymbol}
                      {tx.grandTotal}
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      ✓ Settled
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          id="dash-low-stock-card"
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Low Stock Alerts
              </h2>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <span>Manage Inventory</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="mx-auto h-8 w-8 mb-1" />
                All inventory items are well-stocked!
              </div>
            ) : (
              lowStockProducts.slice(0, 5).map((prod) => (
                <div
                  key={prod.id}
                  id={`low-stock-item-${prod.id}`}
                  className="flex items-center justify-between py-3 -mx-2 px-2 rounded-xl transition hover:bg-stone-50 dark:hover:bg-stone-800/60"
                >
                  <div
                    onClick={() => onSelectProduct(prod)}
                    className="cursor-pointer min-w-0 flex-1 pr-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-stone-900 dark:text-white hover:text-indigo-600">
                        {prod.name}
                      </span>
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        {prod.stockQuantity === 0
                          ? 'Out of Stock'
                          : `${prod.stockQuantity} remaining`}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                      <span>
                        {prod.rack} → {prod.shelf}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`quick-add-stock-${prod.id}`}
                    onClick={() => onOpenAddStock(prod)}
                    className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Stock</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* C29 Student Project Problem-Solution & Technical Pipeline Showcase Card */}
      <div
        id="c29-pipeline-card"
        className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 p-5 shadow-xs dark:border-indigo-900/60 dark:from-stone-900 dark:via-stone-900 dark:to-indigo-950/40"
      >
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          <Sparkles className="h-4 w-4" />
          <span>C29 Problem Solving Architecture • Small Retail Counter AI</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-stone-600 dark:text-stone-300 max-w-4xl">
          <b>Real-World Problem:</b> Small counter-service shopkeepers manually decipher rapid customer multi-item orders, search shelves from memory, hand-calculate bills, and struggle with manual ledger stock updates.
          <br />
          <b>SmartCounter Solution:</b> Connects Speech/Text NLP with local stock location matrices and generates a footstep-optimized picking route, auto-calculates totals, and updates real-time inventory on sale completion.
        </p>

        {/* Visual Pipeline Steps */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[11px] font-bold text-stone-700 sm:grid-cols-4 lg:grid-cols-7 dark:text-stone-300">
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 1</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Speech / Text</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 2</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">NLP Entity Extraction</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 3</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Product Matching</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 4</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Stock & Location DB</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 5</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Smart Picking List</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 6</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Billing Cart</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-2xs dark:border-stone-800 dark:bg-stone-800">
            <span className="text-[10px] text-stone-400">Step 7</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">Auto Stock Sync</p>
          </div>
        </div>
      </div>
    </div>
  );
};
