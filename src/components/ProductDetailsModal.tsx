import { FC, useState } from 'react';
import {
  X,
  Package,
  Layers,
  Edit2,
  Trash2,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Tag,
  Barcode,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailsModalProps {
  isOpen: boolean;
  product: Product | null;
  currencySymbol: string;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onAddStock: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAddToBill?: (product: Product) => void;
}

export const ProductDetailsModal: FC<ProductDetailsModalProps> = ({
  isOpen,
  product,
  currencySymbol,
  onClose,
  onEdit,
  onAddStock,
  onDelete,
  onAddToBill,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !product) return null;

  const isOut = product.stockQuantity === 0;
  const isLow = product.stockQuantity <= product.lowStockThreshold && !isOut;

  return (
    <div
      id="product-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="product-details-modal-card"
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {product.id} • {product.category}
            </span>
            <h2 className="mt-1.5 text-lg font-black text-stone-900 dark:text-white">
              {product.name}
            </h2>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Brand: <span className="text-stone-800 dark:text-stone-200">{product.brand}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-3.5">
          {/* Price & Stock Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-800/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Price
              </span>
              <p className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {currencySymbol}
                {product.price}
              </p>
              <p className="text-[10px] text-stone-400">Per {product.unit || 'unit'}</p>
            </div>

            <div
              className={`rounded-xl border p-3.5 ${
                isOut
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'
                  : isLow
                  ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Current Stock
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-2xl font-black">{product.stockQuantity}</span>
                <span className="text-xs font-semibold">units</span>
              </div>
              <p className="text-[10px]">
                Low Threshold: {product.lowStockThreshold} units
              </p>
            </div>
          </div>

          {/* Location Badge Card */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-300">
                    Physical Store Location
                  </p>
                  <p className="text-sm font-black text-indigo-950 dark:text-white">
                    {product.rack} → {product.shelf}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-200/80 px-2 py-0.5 text-[10px] font-extrabold text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                Counter Zone
              </span>
            </div>
          </div>

          {/* Description / Metadata */}
          {product.description && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/40">
              <p className="text-[11px] font-bold text-stone-500 dark:text-stone-400">
                Description
              </p>
              <p className="mt-0.5 text-xs text-stone-700 dark:text-stone-300">
                {product.description}
              </p>
            </div>
          )}

          {product.barcode && (
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <Barcode className="h-4 w-4" />
              <span>Barcode: {product.barcode}</span>
            </div>
          )}
        </div>

        {/* Delete Confirmation Box */}
        {confirmDelete && (
          <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3.5 dark:border-rose-900 dark:bg-rose-950/60">
            <div className="flex items-start gap-2 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-rose-600" />
              <div>
                <p className="text-xs font-bold">
                  Delete "{product.name}" from catalog?
                </p>
                <p className="text-[11px] text-rose-600 dark:text-rose-300">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                No, Keep It
              </button>
              <button
                id="confirm-delete-product-btn"
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            id="modal-add-stock-btn"
            onClick={() => {
              onAddStock(product);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Stock</span>
          </button>

          <button
            id="modal-edit-product-btn"
            onClick={() => {
              onEdit(product);
              onClose();
            }}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-stone-50 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>

          <button
            id="modal-delete-product-btn"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
