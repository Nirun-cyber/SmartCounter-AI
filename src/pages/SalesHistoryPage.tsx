import { FC, useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Receipt,
  Calendar,
  DollarSign,
  QrCode,
  Banknote,
  Eye,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { ShopSettings, Transaction } from '../types';

interface SalesHistoryPageProps {
  transactions: Transaction[];
  settings: ShopSettings;
  onSelectTransaction: (transaction: Transaction) => void;
}

export const SalesHistoryPage: FC<SalesHistoryPageProps> = ({
  transactions,
  settings,
  onSelectTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'All' | 'Cash' | 'UPI'>('All');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (paymentFilter !== 'All' && tx.paymentMethod !== paymentFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesBill = tx.billNumber.toLowerCase().includes(q);
        const matchesItem = tx.items.some((it) =>
          it.productName.toLowerCase().includes(q)
        );
        if (!matchesBill && !matchesItem) return false;
      }
      return true;
    });
  }, [transactions, searchTerm, paymentFilter]);

  const totalSalesVolume = filteredTransactions.reduce(
    (sum, tx) => sum + tx.grandTotal,
    0
  );

  return (
    <div id="sales-history-page" className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Sales & Invoices
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Audit settled counter bills, transaction amounts and printable slips
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-right shadow-2xs dark:border-stone-800 dark:bg-stone-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Total Invoices Filtered
          </span>
          <p className="text-base font-black text-indigo-600 dark:text-indigo-400">
            {settings.currencySymbol}
            {totalSalesVolume.toLocaleString('en-IN')} ({filteredTransactions.length})
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            id="sales-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by bill number (e.g. 1042) or item name..."
            className="w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
          />
        </div>

        {/* Payment mode filter chips */}
        <div className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white p-1 dark:border-stone-800 dark:bg-stone-900">
          {(['All', 'Cash', 'UPI'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPaymentFilter(mode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                paymentFilter === mode
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div
        id="sales-table-container"
        className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-stone-200 bg-stone-50 font-bold uppercase tracking-wider text-stone-500 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-400">
              <tr>
                <th className="px-4 py-3">Bill #</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Grand Total</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    id={`tx-row-${tx.id}`}
                    onClick={() => onSelectTransaction(tx)}
                    className="cursor-pointer transition hover:bg-stone-50/80 dark:hover:bg-stone-800/50"
                  >
                    {/* Bill Number */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                          <Receipt className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-extrabold text-stone-900 dark:text-white">
                          #{tx.billNumber}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3 text-stone-500 dark:text-stone-400">
                      <div>
                        {new Date(tx.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <span className="text-[10px]">
                        {new Date(tx.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Items Summary */}
                    <td className="px-4 py-3 text-stone-700 dark:text-stone-300">
                      <p className="font-bold">
                        {tx.items.length} item{tx.items.length > 1 ? 's' : ''} (
                        {tx.items.reduce((s, i) => s + i.quantity, 0)} units)
                      </p>
                      <p className="truncate max-w-xs text-[11px] text-stone-400">
                        {tx.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                    </td>

                    {/* Payment Mode */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                          tx.paymentMethod === 'UPI'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {tx.paymentMethod === 'UPI' ? (
                          <QrCode className="h-3 w-3" />
                        ) : (
                          <Banknote className="h-3 w-3" />
                        )}
                        <span>{tx.paymentMethod}</span>
                      </span>
                    </td>

                    {/* Grand Total */}
                    <td className="px-4 py-3 font-black text-stone-900 dark:text-white">
                      {settings.currencySymbol}
                      {tx.grandTotal}
                    </td>

                    {/* Action View */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-stone-700 shadow-2xs hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                      >
                        <Printer className="h-3.5 w-3.5 text-stone-500" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
