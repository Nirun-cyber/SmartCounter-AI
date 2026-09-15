import { FC, useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Mic,
  MapPin,
  Layers,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  QrCode,
  Banknote,
  ShoppingCart,
  X,
  PlusCircle,
} from 'lucide-react';
import { CartItem, PaymentMethod, Product, ShopSettings, Transaction } from '../types';

interface NewBillPageProps {
  products: Product[];
  settings: ShopSettings;
  cart: CartItem[];
  onUpdateCart: (newCart: CartItem[]) => void;
  onCompleteBill: (params: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
  }) => void;
  onNavigateToAiOrder: () => void;
}

export const NewBillPage: FC<NewBillPageProps> = ({
  products,
  settings,
  cart,
  onUpdateCart,
  onCompleteBill,
  onNavigateToAiOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [insufficientStockError, setInsufficientStockError] = useState<string | null>(null);

  // Filter products for fast selection
  const searchResults = useMemo(() => {
    let list = products;
    if (selectedCategory !== 'All') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (!searchTerm.trim()) {
      return list.slice(0, 8);
    }
    const q = searchTerm.toLowerCase();
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.rack.toLowerCase().includes(q) ||
        p.shelf.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [products, searchTerm, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product, addQty = 1) => {
    setInsufficientStockError(null);
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const targetQty = currentQty + addQty;

      if (targetQty > product.stockQuantity) {
        setInsufficientStockError(
          `⚠️ Insufficient stock for ${product.name}. Only ${product.stockQuantity} units available.`
        );
        return;
      }

      const updated = [...cart];
      updated[existingIndex].quantity = targetQty;
      onUpdateCart(updated);
    } else {
      if (addQty > product.stockQuantity) {
        setInsufficientStockError(
          `⚠️ Insufficient stock for ${product.name}. Only ${product.stockQuantity} units available.`
        );
        return;
      }
      onUpdateCart([...cart, { product, quantity: addQty }]);
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    setInsufficientStockError(null);
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.stockQuantity) {
      setInsufficientStockError(
        `⚠️ Insufficient stock for ${product.name}. Only ${product.stockQuantity} units available.`
      );
      return;
    }

    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity: newQty } : item
    );
    onUpdateCart(updated);
  };

  const removeFromCart = (productId: string) => {
    onUpdateCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    onUpdateCart([]);
    setDiscount(0);
    setInsufficientStockError(null);
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const validatedDiscount = Math.min(subtotal, Math.max(0, discount || 0));
  const grandTotal = Math.max(0, subtotal - validatedDiscount);

  const handleCompleteBill = () => {
    setInsufficientStockError(null);
    if (cart.length === 0) return;

    // Validate stock for all items
    for (const item of cart) {
      const freshProd = products.find((p) => p.id === item.product.id);
      if (!freshProd || freshProd.stockQuantity < item.quantity) {
        setInsufficientStockError(
          `⚠️ Insufficient stock for ${item.product.name}. Requested: ${item.quantity}, Available: ${
            freshProd ? freshProd.stockQuantity : 0
          }`
        );
        return;
      }
    }

    onCompleteBill({
      items: cart,
      subtotal,
      discount: validatedDiscount,
      grandTotal,
      paymentMethod,
    });
  };

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

  return (
    <div id="new-bill-page" className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
            Counter Billing
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Rapid product search, location cues & instant cashier invoice
          </p>
        </div>

        {/* AI Order Entry Shortcut */}
        <button
          id="btn-shortcut-ai-order"
          onClick={onNavigateToAiOrder}
          className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 shadow-2xs transition hover:bg-indigo-100 active:scale-95 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900"
        >
          <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>🎤 AI Voice / Order Parser</span>
        </button>
      </div>

      {/* Stock Error Banner if triggered */}
      {insufficientStockError && (
        <div
          id="billing-stock-error-banner"
          className="flex items-center justify-between rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-bold text-rose-800 dark:border-rose-900 dark:bg-rose-950/70 dark:text-rose-200"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{insufficientStockError}</span>
          </div>
          <button
            onClick={() => setInsufficientStockError(null)}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Billing Grid: Left (Product Finder) & Right (Current Bill Cart) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Product Search & Quick Catalog (7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          {/* Search Input Bar with Quick AI Trigger */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="billing-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product name, brand, barcode, rack (e.g. Colgate, Atta)..."
                className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-16 text-sm font-medium text-stone-900 placeholder:text-stone-400 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-900 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-600"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={onNavigateToAiOrder}
              title="Speak or Paste Customer Order"
              className="flex h-[46px] items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500"
            >
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">AI Order</span>
            </button>
          </div>

          {/* Category Chips Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Result Products Grid */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {searchResults.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-xs text-stone-400">
                No matching products found in store catalog.
              </div>
            ) : (
              searchResults.map((product) => {
                const isOut = product.stockQuantity === 0;
                const inCartItem = cart.find((i) => i.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    id={`catalog-card-${product.id}`}
                    className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                      inCartItem
                        ? 'border-indigo-300 bg-indigo-50/40 shadow-xs dark:border-indigo-800 dark:bg-indigo-950/30'
                        : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="truncate text-xs font-bold text-stone-900 dark:text-white">
                          {product.name}
                        </span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                          {settings.currencySymbol}
                          {product.price}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                        <span>{product.brand}</span>
                        {isOut ? (
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            Out of stock
                          </span>
                        ) : (
                          <span
                            className={
                              product.stockQuantity <= product.lowStockThreshold
                                ? 'font-bold text-amber-600 dark:text-amber-400'
                                : 'font-semibold text-emerald-600 dark:text-emerald-400'
                            }
                          >
                            Stock: {product.stockQuantity}
                          </span>
                        )}
                      </div>

                      {/* Location Badge */}
                      <div className="mt-2 flex items-center gap-1.5 rounded-md bg-stone-100 px-2 py-1 text-[11px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        <span>
                          📍 {product.rack} → {product.shelf}
                        </span>
                      </div>
                    </div>

                    {/* Add / Qty Controller */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                      {inCartItem ? (
                        <div className="flex w-full items-center justify-between">
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                            In Cart: {inCartItem.quantity}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              id={`minus-cart-qty-${product.id}`}
                              onClick={() =>
                                updateQuantity(product.id, inCartItem.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">
                              {inCartItem.quantity}
                            </span>
                            <button
                              id={`plus-cart-qty-${product.id}`}
                              disabled={inCartItem.quantity >= product.stockQuantity}
                              onClick={() =>
                                updateQuantity(product.id, inCartItem.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          id={`add-product-btn-${product.id}`}
                          disabled={isOut}
                          onClick={() => addToCart(product, 1)}
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-600 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: CURRENT BILL Cart & Checkout (5 cols) */}
        <div className="lg:col-span-5">
          <div
            id="current-bill-card"
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900"
          >
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900 dark:text-white">
                    CURRENT BILL
                  </h2>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {cart.length} item{cart.length !== 1 ? 's' : ''} in counter cart
                  </p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  id="clear-bill-cart-btn"
                  onClick={clearCart}
                  className="text-xs font-semibold text-stone-400 hover:text-rose-600"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="my-3 max-h-[320px] space-y-2 overflow-y-auto pr-1 divide-y divide-stone-100 dark:divide-stone-800">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
                  <p className="mt-2 text-xs font-bold text-stone-600 dark:text-stone-300">
                    Bill is currently empty
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Select products from catalog or speak order via 🎤 AI
                  </p>
                </div>
              ) : (
                cart.map((item) => {
                  const itemTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      id={`cart-item-${item.product.id}`}
                      className="pt-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-stone-900 dark:text-white">
                          {item.product.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-[10px] text-stone-400">
                          <span>
                            {settings.currencySymbol}
                            {item.product.price} each
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {item.product.rack} / {item.product.shelf}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-extrabold">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.product.stockQuantity}
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="flex items-center gap-2 text-right">
                        <span className="w-14 text-xs font-black text-stone-900 dark:text-white">
                          {settings.currencySymbol}
                          {itemTotal}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-400 hover:text-rose-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Calculations Section */}
            <div className="border-t border-stone-200 pt-3 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal</span>
                <span className="font-bold">
                  {settings.currencySymbol}
                  {subtotal}
                </span>
              </div>

              {/* Discount Manual Input */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-600 dark:text-stone-400">
                  Discount ({settings.currencySymbol})
                </span>
                <input
                  id="billing-discount-input"
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discount || ''}
                  onChange={(e) =>
                    setDiscount(Math.max(0, parseInt(e.target.value, 10) || 0))
                  }
                  placeholder="0"
                  className="w-20 rounded-lg border border-stone-300 bg-stone-50 px-2 py-1 text-right text-xs font-bold text-stone-900 focus:border-indigo-500 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
                />
              </div>

              {/* Grand Total */}
              <div className="mt-2 flex items-center justify-between border-t border-stone-200 pt-2 text-base font-black text-stone-900 dark:border-stone-800 dark:text-white">
                <span>TOTAL</span>
                <span className="text-xl text-indigo-600 dark:text-indigo-400">
                  {settings.currencySymbol}
                  {grandTotal}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="payment-mode-cash"
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                    paymentMethod === 'Cash'
                      ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  <Banknote className="h-4 w-4" />
                  <span>CASH</span>
                </button>

                <button
                  id="payment-mode-upi"
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition active:scale-95 ${
                    paymentMethod === 'UPI'
                      ? 'border-2 border-purple-600 bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'border border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  <QrCode className="h-4 w-4" />
                  <span>UPI</span>
                </button>
              </div>
            </div>

            {/* COMPLETE BILL Action Button */}
            <button
              id="btn-complete-bill"
              disabled={cart.length === 0}
              onClick={handleCompleteBill}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>COMPLETE BILL ({settings.currencySymbol}{grandTotal})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
