import { FC, useMemo } from 'react';
import {
  TrendingUp,
  Receipt,
  Award,
  CreditCard,
  QrCode,
  Banknote,
  Boxes,
  PieChart as PieChartIcon,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Product, ShopSettings, Transaction } from '../types';

interface AnalyticsPageProps {
  products: Product[];
  transactions: Transaction[];
  settings: ShopSettings;
}

export const AnalyticsPage: FC<AnalyticsPageProps> = ({
  products,
  transactions,
  settings,
}) => {
  // Aggregate Metrics
  const totalRevenue = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.grandTotal, 0);
  }, [transactions]);

  const totalBills = transactions.length;
  const averageBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    let upiTotal = 0;
    let upiCount = 0;
    let cashTotal = 0;
    let cashCount = 0;

    for (const tx of transactions) {
      if (tx.paymentMethod === 'UPI') {
        upiTotal += tx.grandTotal;
        upiCount += 1;
      } else {
        cashTotal += tx.grandTotal;
        cashCount += 1;
      }
    }

    return {
      upiTotal,
      upiCount,
      upiPercent: totalRevenue > 0 ? Math.round((upiTotal / totalRevenue) * 100) : 0,
      cashTotal,
      cashCount,
      cashPercent: totalRevenue > 0 ? Math.round((cashTotal / totalRevenue) * 100) : 0,
    };
  }, [transactions, totalRevenue]);

  // Top Selling Products
  const topProducts = useMemo(() => {
    const counts: Record<
      string,
      { id: string; name: string; brand: string; qty: number; revenue: number }
    > = {};

    for (const tx of transactions) {
      for (const item of tx.items) {
        if (!counts[item.productId]) {
          counts[item.productId] = {
            id: item.productId,
            name: item.productName,
            brand: '',
            qty: 0,
            revenue: 0,
          };
        }
        counts[item.productId].qty += item.quantity;
        counts[item.productId].revenue += item.totalPrice;
      }
    }

    return Object.values(counts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6);
  }, [transactions]);

  // Category Revenue Breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      for (const item of tx.items) {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod ? prod.category : 'General';
        map[cat] = (map[cat] || 0) + item.totalPrice;
      }
    }
    const entries = Object.entries(map).sort(([, a], [, b]) => b - a);
    const maxVal = entries.length > 0 ? entries[0][1] : 1;
    return entries.map(([category, amount]) => ({
      category,
      amount,
      percent: Math.round((amount / (totalRevenue || 1)) * 100),
      barWidthPercent: Math.round((amount / maxVal) * 100),
    }));
  }, [transactions, products, totalRevenue]);

  return (
    <div id="analytics-page" className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          Sales Analytics
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Store performance metrics, payment mode splits, and product velocity
        </p>
      </div>

      {/* 3 Core Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Revenue
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-stone-900 dark:text-white">
            {settings.currencySymbol}
            {totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Across {totalBills} settled transactions
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Total Bills Settled
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-stone-900 dark:text-white">
            {totalBills}
          </p>
          <p className="mt-1 text-xs text-stone-400">Counter transactions</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Average Bill Value
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-stone-900 dark:text-white">
            {settings.currencySymbol}
            {averageBillValue}
          </p>
          <p className="mt-1 text-xs text-stone-400">Per counter customer</p>
        </div>
      </div>

      {/* Middle Section: Payment Mode Split & Top Selling Products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Payment Split (5 cols) */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 lg:col-span-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
            <PieChartIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-black text-stone-900 dark:text-white">
              Payment Method Breakdown
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            {/* Visual Bar Proportion */}
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                style={{ width: `${paymentBreakdown.upiPercent}%` }}
                className="bg-purple-600 transition-all duration-500"
                title={`UPI: ${paymentBreakdown.upiPercent}%`}
              />
              <div
                style={{ width: `${paymentBreakdown.cashPercent}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Cash: ${paymentBreakdown.cashPercent}%`}
              />
            </div>

            {/* UPI Row */}
            <div className="flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 dark:border-purple-900/40 dark:bg-purple-950/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-white">
                    UPI Digital Payments
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {paymentBreakdown.upiCount} bills ({paymentBreakdown.upiPercent}%)
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-purple-700 dark:text-purple-300">
                {settings.currencySymbol}
                {paymentBreakdown.upiTotal.toLocaleString('en-IN')}
              </p>
            </div>

            {/* Cash Row */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Banknote className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 dark:text-white">
                    Cash Payments
                  </p>
                  <p className="text-[11px] text-stone-400">
                    {paymentBreakdown.cashCount} bills ({paymentBreakdown.cashPercent}%)
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">
                {settings.currencySymbol}
                {paymentBreakdown.cashTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Top Selling Products (7 cols) */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 lg:col-span-7">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-black text-stone-900 dark:text-white">
                Top Selling Fast-Moving Products
              </h2>
            </div>
            <span className="text-xs text-stone-400">By Units Sold</span>
          </div>

          <div className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-stone-400">
                No items sold yet.
              </p>
            ) : (
              topProducts.map((prod, idx) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 text-xs font-black text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {prod.qty} units moved
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {settings.currencySymbol}
                      {prod.revenue}
                    </p>
                    <span className="text-[10px] text-stone-400">Sales Value</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Performance Bar Chart */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-black text-stone-900 dark:text-white">
            Revenue Contribution by Category
          </h2>
        </div>

        <div className="mt-4 space-y-3">
          {categoryBreakdown.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {cat.category}
                </span>
                <span className="font-bold text-stone-600 dark:text-stone-400">
                  {settings.currencySymbol}
                  {cat.amount.toLocaleString('en-IN')} ({cat.percent}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-stone-100 dark:bg-stone-800">
                <div
                  style={{ width: `${cat.barWidthPercent}%` }}
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
