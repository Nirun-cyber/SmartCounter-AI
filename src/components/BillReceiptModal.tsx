import { FC, useState } from 'react';
import {
  CheckCircle,
  Printer,
  X,
  PlusCircle,
  Share2,
  Smartphone,
  Copy,
  Check,
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
  const [viewMode, setViewMode] = useState<'thermal' | 'digital'>('thermal');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://msnstores.smartcounter.local/bill/${transaction.billNumber}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateSend = () => {
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

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
        <div className="mb-3 flex items-center justify-between">
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

        {/* View Mode Toggle */}
        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => setViewMode('thermal')}
            className={`rounded-lg py-1.5 text-xs font-bold transition ${
              viewMode === 'thermal'
                ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-white'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            Thermal Slip
          </button>
          <button
            type="button"
            onClick={() => setViewMode('digital')}
            className={`rounded-lg py-1.5 text-xs font-bold transition ${
              viewMode === 'digital'
                ? 'bg-white text-stone-900 shadow-2xs dark:bg-stone-700 dark:text-white'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            Digital E-Bill (WhatsApp)
          </button>
        </div>

        {/* Thermal Slip View */}
        {viewMode === 'thermal' && (
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
                <p className="text-stone-500 dark:text-stone-400">
                  Cashier: {settings.shopkeeperName}
                </p>
              </div>
              <div className="text-right text-[11px] text-stone-500 dark:text-stone-400">
                <p>{formattedDate}</p>
                <p>{formattedTime}</p>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-2.5">
              <div className="flex justify-between border-b border-stone-200 pb-1 text-[11px] font-bold text-stone-400 dark:border-stone-800">
                <span className="w-1/2">ITEM</span>
                <span className="w-1/4 text-center">QTY</span>
                <span className="w-1/4 text-right">AMT</span>
              </div>
              <div className="divide-y divide-stone-100 py-1 text-xs dark:divide-stone-800">
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1.5">
                    <div className="w-1/2 min-w-0 pr-1">
                      <p className="truncate font-bold text-stone-900 dark:text-white">
                        {item.productName}
                      </p>
                      <span className="text-[10px] text-stone-400">
                        {item.brand} ({item.rack})
                      </span>
                    </div>
                    <span className="w-1/4 text-center text-stone-600 dark:text-stone-400">
                      {item.quantity} x {settings.currencySymbol}{item.unitPrice}
                    </span>
                    <span className="w-1/4 text-right font-bold text-stone-900 dark:text-white">
                      {settings.currencySymbol}
                      {item.totalPrice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Totals */}
            <div className="border-t border-dashed border-stone-300 pt-2 text-xs space-y-1 dark:border-stone-700">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
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
        )}

        {/* Digital E-Bill View */}
        {viewMode === 'digital' && (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3 dark:border-stone-800 dark:bg-stone-950">
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">
                Customer Mobile Number (SMS / WhatsApp)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleSimulateSend}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95"
                >
                  <Share2 className="h-3.5 w-3.5 inline mr-1" />
                  Send
                </button>
              </div>
              {sentSuccess && (
                <p className="mt-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ✓ Digital bill dispatched to {customerPhone}!
                </p>
              )}
            </div>

            {/* Digital Card Preview */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-stone-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-stone-200">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                📲 {settings.shopName} Digital Receipt #{transaction.billNumber}
              </p>
              <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                Total: <b>{settings.currencySymbol}{transaction.grandTotal}</b> ({transaction.items.length} items) • {transaction.paymentMethod}
              </p>
              <p className="mt-2 text-[10px] text-stone-500">
                UPI Reference: <code>{settings.upiId}</code>
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-[10px] font-bold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
              >
                {copiedLink ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Digital E-Bill Link'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
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
