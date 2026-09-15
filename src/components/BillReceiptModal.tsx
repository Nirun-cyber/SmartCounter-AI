import { FC } from 'react';
import {
  CheckCircle,
  Printer,
  X,
  Receipt,
  PlusCircle,
  ShoppingBag,
} from 'lucide-react';
import { ShopSettings, Transaction } from '../types';

interface BillReceiptModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  settings: ShopSettings;
  onClose: () => void;
  onStartNewBill: () => void;
}

export const BillReceiptModal: FC<BillReceiptModalProps> = ({
  isOpen,
  transaction,
  settings,
  onClose,
  onStartNewBill,
}) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(transaction.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="receipt-modal-card"
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Success Banner */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
            <div>
              <h3 className="text-base font-extrabold uppercase tracking-wide">
                Bill Completed
              </h3>
              <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                Stock updated in inventory immediately
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

        {/* Printable Thermal Receipt Container */}
        <div
          id="printable-receipt"
          className="rounded-xl border border-stone-200 bg-stone-50 p-4 font-mono text-stone-800 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200"
        >
          {/* Shop Header */}
          <div className="border-b border-dashed border-stone-300 pb-3 text-center dark:border-stone-700">
            <h4 className="text-base font-black tracking-tight uppercase">
              {settings.shopName}
            </h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
              {settings.tagline}
            </p>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 font-sans">
              {settings.address}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans">
              Phone: {settings.phone}
            </p>
          </div>

          {/* Bill Metadata */}
          <div className="flex justify-between border-b border-dashed border-stone-300 py-2.5 text-xs dark:border-stone-700">
            <div>
              <p className="font-bold text-stone-900 dark:text-white">
                Bill #{transaction.billNumber}
              </p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Mode: <span className="font-bold text-stone-800 dark:text-stone-200">{transaction.paymentMethod}</span>
              </p>
            </div>
            <div className="text-right text-[11px] text-stone-500 dark:text-stone-400">
              <p>{formattedDate}</p>
              <p>{formattedTime}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-2">
            <div className="flex justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400">
              <span className="w-1/2">Item</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/6 text-right">Price</span>
              <span className="w-1/6 text-right">Total</span>
            </div>
            <div className="my-1 border-b border-stone-300 dark:border-stone-700" />
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {transaction.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between text-xs font-medium"
                >
                  <div className="w-1/2 min-w-0 pr-1">
                    <p className="truncate font-sans font-semibold text-stone-800 dark:text-stone-200">
                      {item.productName}
                    </p>
                    <p className="text-[9px] text-stone-400 font-sans">
                      {item.rack} / {item.shelf}
                    </p>
                  </div>
                  <span className="w-1/6 text-center">{item.quantity}</span>
                  <span className="w-1/6 text-right">₹{item.unitPrice}</span>
                  <span className="w-1/6 text-right font-bold">
                    ₹{item.totalPrice}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Section */}
          <div className="border-t border-dashed border-stone-300 pt-2.5 text-xs dark:border-stone-700">
            <div className="flex justify-between text-stone-500 dark:text-stone-400">
              <span>Subtotal</span>
              <span>
                {settings.currencySymbol}
                {transaction.subtotal}
              </span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount</span>
                <span>
                  -{settings.currencySymbol}
                  {transaction.discount}
                </span>
              </div>
            )}
            <div className="mt-1.5 flex items-center justify-between border-t border-stone-300 pt-1.5 text-sm font-black text-stone-900 dark:border-stone-700 dark:text-white">
              <span>GRAND TOTAL</span>
              <span className="text-base">
                {settings.currencySymbol}
                {transaction.grandTotal}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
              <span>Paid via {transaction.paymentMethod}</span>
              <span>PAID ✓</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-3 border-t border-dashed border-stone-300 pt-2 text-center text-[10px] text-stone-500 dark:border-stone-700 dark:text-stone-400 font-sans">
            <p>{settings.receiptFooter}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            id="print-receipt-btn"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-bold text-stone-700 shadow-xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          >
            <Printer className="h-4 w-4" />
            <span>Print Receipt</span>
          </button>

          <button
            id="start-next-bill-btn"
            onClick={() => {
              onClose();
              onStartNewBill();
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Next Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
};
