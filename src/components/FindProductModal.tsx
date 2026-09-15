import { FC, useState, useMemo } from 'react';
import {
  Search,
  X,
  MapPin,
  Plus,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Product } from '../types';

interface FindProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddToBill: (product: Product) => void;
  currencySymbol: string;
}

export const FindProductModal: FC<FindProductModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToBill,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) {
      return products.slice(0, 10);
    }
    const q = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.rack.toLowerCase().includes(q) ||
        p.shelf.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      id="find-product-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/60 p-4 pt-12 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="find-product-modal-card"
        className="w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-white">
                Find Product Location
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Instant counter lookup for rack & shelf positions
              </p>
            </div>
          </div>
          <button
            id="close-find-modal-btn"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="relative my-4">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="find-product-input"
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type product name, brand, rack (e.g. Colgate, Atta, Rack B)..."
            className="w-full rounded-xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-4 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:focus:bg-stone-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
              <p className="mt-2 text-sm font-semibold text-stone-700 dark:text-stone-300">
                No products found
              </p>
              <p className="text-xs text-stone-400">
                Try searching by brand or category instead
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isOut = product.stockQuantity === 0;
              const isLow = product.stockQuantity <= product.lowStockThreshold && !isOut;

              return (
                <div
                  key={product.id}
                  id={`found-product-${product.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 transition hover:border-indigo-200 hover:bg-white dark:border-stone-800 dark:bg-stone-800/50 dark:hover:border-indigo-800 dark:hover:bg-stone-800 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-stone-900 dark:text-white">
                        {product.name}
                      </span>
                      <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 dark:bg-stone-700 dark:text-stone-300">
                        {product.brand}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span>
                        {currencySymbol}
                        {product.price}
                      </span>
                      <span>•</span>
                      {isOut ? (
                        <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5" /> Out of stock
                        </span>
                      ) : isLow ? (
                        <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                          <AlertCircle className="h-3.5 w-3.5" /> Low Stock: {product.stockQuantity} left
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> In Stock: {product.stockQuantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Physical Location Badge */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-200">
                      <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <span>{product.rack}</span>
                        <span className="mx-1 text-indigo-400">→</span>
                        <span>{product.shelf}</span>
                      </div>
                    </div>

                    <button
                      id={`add-from-find-${product.id}`}
                      disabled={isOut}
                      onClick={() => {
                        onAddToBill(product);
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Bill</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
