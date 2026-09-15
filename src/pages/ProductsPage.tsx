import { FC, useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  AlertTriangle,
  PackageCheck,
  MapPin,
  Edit2,
  PlusCircle,
  Eye,
  Layers,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Product, ProductCategory, ShopSettings } from '../types';

interface ProductsPageProps {
  products: Product[];
  settings: ShopSettings;
  onOpenAddProduct: () => void;
  onSelectProduct: (product: Product) => void;
  onOpenAddStock: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

export const ProductsPage: FC<ProductsPageProps> = ({
  products,
  settings,
  onOpenAddProduct,
  onSelectProduct,
  onOpenAddStock,
  onEditProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [activeView, setActiveView] = useState<'list' | 'rack-map'>('list');

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock status filter
      if (stockFilter === 'low' && (p.stockQuantity > p.lowStockThreshold || p.stockQuantity === 0)) {
        return false;
      }
      if (stockFilter === 'out' && p.stockQuantity > 0) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.rack.toLowerCase().includes(q) ||
          p.shelf.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategory, stockFilter]);

  // Rack grouping for the store map visualizer
  const rackGroups = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const p of products) {
      if (!map[p.rack]) map[p.rack] = [];
      map[p.rack].push(p);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [products]);

  const categories = [
    'All',
    'Groceries',
    'Biscuits',
    'Beverages',
    'Personal Care',
    'Home Cleaning',
    'Snacks',
    'Stationery',
    'Fancy Items',
  ];

  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div id="products-page" className="space-y-5">
      {/* Top Title & Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Inventory & Stock
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Manage {products.length} products, rack locations, and real-time inventory counts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle (List vs Store Rack Map) */}
          <div className="flex rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900">
            <button
              onClick={() => setActiveView('list')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeView === 'list'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              Inventory List
            </button>
            <button
              onClick={() => setActiveView('rack-map')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeView === 'rack-map'
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              📍 Store Rack Map
            </button>
          </div>

          <button
            id="btn-add-new-product"
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Status Bar */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setStockFilter('all')}
          className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
            stockFilter === 'all'
              ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs dark:border-indigo-800 dark:bg-indigo-950/40'
              : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-stone-500">All Items</span>
            <p className="text-lg font-black text-stone-900 dark:text-white">
              {products.length}
            </p>
          </div>
          <PackageCheck className="h-5 w-5 text-indigo-500" />
        </button>

        <button
          onClick={() => setStockFilter('low')}
          className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
            stockFilter === 'low'
              ? 'border-amber-500 bg-amber-50 shadow-2xs dark:border-amber-800 dark:bg-amber-950/40'
              : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
              Low Stock
            </span>
            <p className="text-lg font-black text-amber-700 dark:text-amber-300">
              {lowStockCount}
            </p>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </button>

        <button
          onClick={() => setStockFilter('out')}
          className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
            stockFilter === 'out'
              ? 'border-rose-500 bg-rose-50 shadow-2xs dark:border-rose-800 dark:bg-rose-950/40'
              : 'border-stone-200 bg-white hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
              Out of Stock
            </span>
            <p className="text-lg font-black text-rose-700 dark:text-rose-300">
              {outOfStockCount}
            </p>
          </div>
          <XCircle className="h-5 w-5 text-rose-500" />
        </button>
      </div>

      {activeView === 'rack-map' ? (
        /* Store Shelf Visual Map View */
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Counter Physical Layout Matrix</span>
            </div>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              This layout matches the actual shelves behind your counter. Shopkeeper can glance here or in picking lists to locate items immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rackGroups.map(([rackName, prods]) => (
              <div
                key={rackName}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900"
              >
                <div className="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-black text-white">
                      {rackName.replace('Rack ', '')}
                    </span>
                    <h3 className="text-sm font-black text-stone-900 dark:text-white">
                      {rackName}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-stone-400">
                    {prods.length} products
                  </span>
                </div>

                <div className="mt-3 space-y-2">
                  {prods.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => onSelectProduct(prod)}
                      className="group flex cursor-pointer items-center justify-between rounded-lg border border-stone-100 bg-stone-50 p-2 text-xs transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-stone-800 dark:bg-stone-800/60"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="truncate font-bold text-stone-800 group-hover:text-indigo-600 dark:text-stone-200">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {prod.shelf} • {settings.currencySymbol}
                          {prod.price}
                        </p>
                      </div>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          prod.stockQuantity <= prod.lowStockThreshold
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {prod.stockQuantity} qty
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Inventory Table & Filter View */
        <div className="space-y-4">
          {/* Search and Category Filter Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="products-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name, brand, category, rack..."
                className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products Table */}
          <div
            id="products-table-container"
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-400">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        No products match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isOut = product.stockQuantity === 0;
                      const isLow =
                        product.stockQuantity <= product.lowStockThreshold && !isOut;

                      return (
                        <tr
                          key={product.id}
                          id={`product-row-${product.id}`}
                          className="transition hover:bg-stone-50/80 dark:hover:bg-stone-800/50"
                        >
                          {/* Name & Brand */}
                          <td className="px-4 py-3">
                            <div
                              onClick={() => onSelectProduct(product)}
                              className="cursor-pointer font-bold text-stone-900 hover:text-indigo-600 dark:text-white"
                            >
                              {product.name}
                            </div>
                            <span className="text-[11px] text-stone-400">
                              {product.brand}
                            </span>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-3 text-stone-600 dark:text-stone-300">
                            <span className="rounded bg-stone-100 px-2 py-0.5 font-medium dark:bg-stone-800">
                              {product.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-3 font-bold text-stone-900 dark:text-white">
                            {settings.currencySymbol}
                            {product.price}
                          </td>

                          {/* Stock Status */}
                          <td className="px-4 py-3">
                            {isOut ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                <XCircle className="h-3 w-3" /> Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <AlertTriangle className="h-3 w-3" /> {product.stockQuantity} (Low)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" /> {product.stockQuantity} in stock
                              </span>
                            )}
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 font-bold text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-200">
                              <MapPin className="h-3 w-3 text-indigo-500" />
                              {product.rack} → {product.shelf}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`row-add-stock-${product.id}`}
                                onClick={() => onOpenAddStock(product)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                                title="Quickly add stock units"
                              >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>+Stock</span>
                              </button>

                              <button
                                id={`row-edit-product-${product.id}`}
                                onClick={() => onEditProduct(product)}
                                className="rounded-lg border border-stone-200 p-1 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                                title="Edit product"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                id={`row-view-product-${product.id}`}
                                onClick={() => onSelectProduct(product)}
                                className="rounded-lg border border-stone-200 p-1 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300"
                                title="View details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
