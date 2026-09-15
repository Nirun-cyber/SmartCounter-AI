import { FC, useState, useEffect, FormEvent } from 'react';
import { X, Save, Boxes, Layers, Tag, DollarSign, FileText } from 'lucide-react';
import { Product, ProductCategory } from '../types';

interface ProductFormModalProps {
  isOpen: boolean;
  productToEdit: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>, existingId?: string) => void;
  currencySymbol: string;
}

const CATEGORIES: ProductCategory[] = [
  'Groceries',
  'Biscuits',
  'Beverages',
  'Personal Care',
  'Home Cleaning',
  'Snacks',
  'Stationery',
  'Fancy Items',
];

const RACKS = ['Rack A', 'Rack B', 'Rack C', 'Rack D', 'Rack E', 'Rack F', 'Rack G', 'Counter'];
const SHELVES = ['Shelf 1', 'Shelf 2', 'Shelf 3', 'Top Shelf', 'Bottom Bin'];

export const ProductFormModal: FC<ProductFormModalProps> = ({
  isOpen,
  productToEdit,
  onClose,
  onSave,
  currencySymbol,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Groceries');
  const [price, setPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [rack, setRack] = useState('Rack A');
  const [shelf, setShelf] = useState('Shelf 1');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('packet');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setStockQuantity(productToEdit.stockQuantity);
      setLowStockThreshold(productToEdit.lowStockThreshold);
      setRack(productToEdit.rack);
      setShelf(productToEdit.shelf);
      setDescription(productToEdit.description || '');
      setUnit(productToEdit.unit || 'packet');
    } else {
      setName('');
      setBrand('');
      setCategory('Groceries');
      setPrice(20);
      setStockQuantity(10);
      setLowStockThreshold(5);
      setRack('Rack A');
      setShelf('Shelf 1');
      setDescription('');
      setUnit('packet');
    }
    setErrors({});
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Product name is required';
    if (!brand.trim()) newErrors.brand = 'Brand name is required';
    if (price <= 0) newErrors.price = 'Price must be greater than 0';
    if (stockQuantity < 0) newErrors.stockQuantity = 'Stock cannot be negative';
    if (lowStockThreshold < 0) newErrors.lowStockThreshold = 'Threshold cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        name: name.trim(),
        brand: brand.trim(),
        category,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        lowStockThreshold: Number(lowStockThreshold),
        rack,
        shelf,
        description: description.trim(),
        unit: unit.trim(),
      },
      productToEdit ? productToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div
      id="product-form-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="product-form-modal-card"
        className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Boxes className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Product Name *
            </label>
            <input
              id="input-product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Colgate Strong Teeth"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
          </div>

          {/* Brand & Category */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Brand *
              </label>
              <input
                id="input-product-brand"
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Colgate, Nestle"
                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
              {errors.brand && <p className="mt-1 text-xs text-rose-500">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Category *
              </label>
              <select
                id="select-product-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price, Stock & Threshold */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Price ({currencySymbol}) *
              </label>
              <input
                id="input-product-price"
                type="number"
                min="1"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
              {errors.price && <p className="mt-1 text-xs text-rose-500">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Stock Qty *
              </label>
              <input
                id="input-product-stock"
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
              {errors.stockQuantity && (
                <p className="mt-1 text-xs text-rose-500">{errors.stockQuantity}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Low Alert *
              </label>
              <input
                id="input-product-low-stock"
                type="number"
                min="1"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 1)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
              />
            </div>
          </div>

          {/* Location: Rack & Shelf */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Physical Counter Location (For Picking)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Rack
                </label>
                <select
                  id="select-product-rack"
                  value={rack}
                  onChange={(e) => setRack(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-900 focus:outline-none dark:border-indigo-800 dark:bg-stone-900 dark:text-indigo-200"
                >
                  {RACKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                  Shelf
                </label>
                <select
                  id="select-product-shelf"
                  value={shelf}
                  onChange={(e) => setShelf(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-900 focus:outline-none dark:border-indigo-800 dark:bg-stone-900 dark:text-indigo-200"
                >
                  {SHELVES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Description / Notes (Optional)
            </label>
            <input
              id="input-product-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 100g tube with amino shakti formula"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              Cancel
            </button>
            <button
              id="save-product-btn"
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Save className="h-4 w-4" />
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
