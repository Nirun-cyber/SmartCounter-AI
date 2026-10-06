import { FC } from 'react';
import { X, MapPin, Navigation, Sparkles, Footprints, Layers } from 'lucide-react';
import { Product, PickingItem } from '../types';

interface StoreMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightedItems?: (Product | PickingItem)[];
  title?: string;
}

export const StoreMapModal: FC<StoreMapModalProps> = ({
  isOpen,
  onClose,
  highlightedItems = [],
  title = 'MSN Stores • Floor Plan & Rack Pathfinder',
}) => {
  if (!isOpen) return null;

  // Extract products from highlightedItems
  const productsToHighlight = highlightedItems.map((item) =>
    'product' in item ? item.product : item
  );

  const getRackItemCount = (rackName: string) => {
    return productsToHighlight.filter(
      (p) => p.rack.toLowerCase() === rackName.toLowerCase()
    ).length;
  };

  const getRackProducts = (rackName: string) => {
    return productsToHighlight.filter(
      (p) => p.rack.toLowerCase() === rackName.toLowerCase()
    );
  };

  const hasItemsInRack = (rackName: string) => getRackItemCount(rackName) > 0;

  // Calculate estimated distance metrics
  const activeRacksCount = ['Rack A', 'Rack B', 'Rack C', 'Rack D'].filter(
    (r) => hasItemsInRack(r)
  ).length;

  const estimatedStepsWithoutOptimizer = Math.max(12, productsToHighlight.length * 18);
  const estimatedStepsWithOptimizer = Math.max(8, activeRacksCount * 10 + productsToHighlight.length * 4);
  const stepsSaved = Math.max(0, estimatedStepsWithoutOptimizer - estimatedStepsWithOptimizer);
  const percentageSaved = Math.round((stepsSaved / Math.max(1, estimatedStepsWithoutOptimizer)) * 100);

  return (
    <div
      id="store-map-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="store-map-modal-card"
        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 p-5 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-stone-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Spatial Coordinate Tracking & Footstep-Optimized Counter Pathfinder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pathfinder Efficiency Metrics Banner */}
        <div className="grid grid-cols-1 border-b border-stone-100 bg-stone-50/70 p-4 sm:grid-cols-3 dark:border-stone-800 dark:bg-stone-950/40">
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Active Pick Targets
              </p>
              <p className="text-sm font-black text-stone-900 dark:text-white">
                {productsToHighlight.length} item{productsToHighlight.length === 1 ? '' : 's'} across {activeRacksCount} rack{activeRacksCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Footprints className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Optimized Path
              </p>
              <p className="text-sm font-black text-stone-900 dark:text-white">
                ~{estimatedStepsWithOptimizer} steps (vs ~{estimatedStepsWithoutOptimizer} random)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Counter Step Savings
              </p>
              <p className="text-sm font-black text-purple-600 dark:text-purple-400">
                {percentageSaved > 0 ? `${percentageSaved}% travel reduction` : 'Optimal linear route'}
              </p>
            </div>
          </div>
        </div>

        {/* 2D Interactive Store Layout Plan */}
        <div className="p-6">
          <div className="relative rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-6 dark:border-stone-800 dark:bg-stone-950/20">
            {/* Top North Indicator */}
            <div className="absolute right-4 top-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Store Rear ⬆
            </div>

            {/* Visual Store Grid */}
            <div className="space-y-6">
              {/* Row 1: Back Racks (Rack A & Rack B) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Rack A: Groceries */}
                <div
                  className={`relative rounded-xl border p-4 transition-all ${
                    hasItemsInRack('Rack A')
                      ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/30 dark:bg-indigo-950/40'
                      : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                        A
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                          Rack A • Groceries & Staples
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          Shelf 1-4 • Atta, Rice, Sugar, Tea, Oil
                        </p>
                      </div>
                    </div>
                    {hasItemsInRack('Rack A') && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white animate-pulse">
                        {getRackItemCount('Rack A')} to pick
                      </span>
                    )}
                  </div>

                  {/* Products inside this rack */}
                  {hasItemsInRack('Rack A') && (
                    <div className="mt-3 space-y-1 border-t border-indigo-200/60 pt-2 dark:border-indigo-800/60">
                      {getRackProducts('Rack A').map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md bg-white/80 px-2 py-1 text-[11px] font-semibold text-stone-800 dark:bg-stone-800/80 dark:text-stone-200"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                            {p.shelf}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rack B: Biscuits & Snacks */}
                <div
                  className={`relative rounded-xl border p-4 transition-all ${
                    hasItemsInRack('Rack B')
                      ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/30 dark:bg-indigo-950/40'
                      : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                        B
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                          Rack B • Biscuits & Snacks
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          Shelf 1-3 • Parle-G, Good Day, Maggi, Bhujia
                        </p>
                      </div>
                    </div>
                    {hasItemsInRack('Rack B') && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white animate-pulse">
                        {getRackItemCount('Rack B')} to pick
                      </span>
                    )}
                  </div>

                  {hasItemsInRack('Rack B') && (
                    <div className="mt-3 space-y-1 border-t border-indigo-200/60 pt-2 dark:border-indigo-800/60">
                      {getRackProducts('Rack B').map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md bg-white/80 px-2 py-1 text-[11px] font-semibold text-stone-800 dark:bg-stone-800/80 dark:text-stone-200"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                            {p.shelf}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Central Aisle Visualizer */}
              <div className="flex items-center justify-center gap-4 py-1 text-center">
                <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  ⚡ Central Walking Aisle (Optimal Serpentine Route) ⚡
                </span>
                <div className="h-px flex-1 bg-stone-300 dark:bg-stone-700" />
              </div>

              {/* Row 2: Front Racks (Rack C & Rack D) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Rack C: Personal Care */}
                <div
                  className={`relative rounded-xl border p-4 transition-all ${
                    hasItemsInRack('Rack C')
                      ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/30 dark:bg-indigo-950/40'
                      : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                        C
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                          Rack C • Personal Care
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          Shelf 1-3 • Colgate, Lux, Dettol, Shampoo
                        </p>
                      </div>
                    </div>
                    {hasItemsInRack('Rack C') && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white animate-pulse">
                        {getRackItemCount('Rack C')} to pick
                      </span>
                    )}
                  </div>

                  {hasItemsInRack('Rack C') && (
                    <div className="mt-3 space-y-1 border-t border-indigo-200/60 pt-2 dark:border-indigo-800/60">
                      {getRackProducts('Rack C').map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md bg-white/80 px-2 py-1 text-[11px] font-semibold text-stone-800 dark:bg-stone-800/80 dark:text-stone-200"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                            {p.shelf}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rack D: Home Cleaning */}
                <div
                  className={`relative rounded-xl border p-4 transition-all ${
                    hasItemsInRack('Rack D')
                      ? 'border-indigo-500 bg-indigo-50/80 shadow-md ring-2 ring-indigo-500/30 dark:bg-indigo-950/40'
                      : 'border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                        D
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-white">
                          Rack D • Home Cleaning & Detergents
                        </h4>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          Shelf 1-3 • Surf Excel, Vim Gel, Harpic
                        </p>
                      </div>
                    </div>
                    {hasItemsInRack('Rack D') && (
                      <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white animate-pulse">
                        {getRackItemCount('Rack D')} to pick
                      </span>
                    )}
                  </div>

                  {hasItemsInRack('Rack D') && (
                    <div className="mt-3 space-y-1 border-t border-indigo-200/60 pt-2 dark:border-indigo-800/60">
                      {getRackProducts('Rack D').map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-md bg-white/80 px-2 py-1 text-[11px] font-semibold text-stone-800 dark:bg-stone-800/80 dark:text-stone-200"
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                            {p.shelf}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Cashier Counter Station */}
              <div className="rounded-xl border border-stone-300 bg-stone-100 p-3.5 text-center dark:border-stone-700 dark:bg-stone-800/70">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-stone-800 dark:text-white">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Main Counter & Cashier POS Station (Start & Finish Point)</span>
                </div>
                <p className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">
                  Shopkeeper stands here • Path begins here, sweeps Rack A → B → C → D in order, then returns to counter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            SmartCounter AI Spatial Matrix • MSN Stores Layout Configuration
          </p>
          <button
            onClick={onClose}
            className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
