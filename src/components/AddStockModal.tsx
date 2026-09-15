import { FC, useState, FormEvent } from 'react';
import { X, Plus, PackagePlus, AlertTriangle } from 'lucide-react';
import { Product } from '../types';

interface AddStockModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirmAdd: (productId: string, amount: number) => void;
}

export const AddStockModal: FC<AddStockModalProps> = ({
  isOpen,
  product,
  onClose,
  onConfirmAdd,
}) => {
  const [amount, setAmount] = useState(10);

  if (!isOpen || !product) return null;

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    onConfirmAdd(product.id, amount);
    onClose();
  };

  const quickAmounts = [5, 10, 20, 50];

  return (
    <div
      id="add-stock-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="add-stock-modal-card"
        className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <PackagePlus className="h-5 w-5" />
            <h3 className="text-base font-bold text-stone-900 dark:text-white">
              Add Stock Inventory
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="mt-4 space-y-4">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/60">
            <p className="text-xs font-bold text-stone-900 dark:text-white">
              {product.name}
            </p>
            <div className="mt-1 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>
                Current Stock: <b className="text-stone-800 dark:text-stone-200">{product.stockQuantity}</b>
              </span>
              <span>
                📍 {product.rack} / {product.shelf}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Units to Add
            </label>
            <input
              id="input-add-stock-amount"
              type="number"
              min="1"
              max="999"
              autoFocus
              required
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-center text-lg font-black text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400">Quick:</span>
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  amount === q
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                +{q}
              </button>
            ))}
          </div>

          <div className="rounded-lg bg-emerald-50 p-2.5 text-center text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            New Stock will be: {product.stockQuantity + (amount || 0)} units
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              Cancel
            </button>
            <button
              id="confirm-add-stock-btn"
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4" />
              <span>Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
