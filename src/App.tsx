/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ActiveTab,
  CartItem,
  PaymentMethod,
  Product,
  ShopSettings,
  Transaction,
} from './types';
import {
  getStoredProducts,
  getStoredTransactions,
  getStoredSettings,
  saveProduct,
  addStockUnits,
  deleteProduct,
  saveTransaction,
  deductStockForBill,
  saveSettings,
  resetToSeedData,
} from './services/storageService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { FindProductModal } from './components/FindProductModal';
import { BillReceiptModal } from './components/BillReceiptModal';
import { ProductFormModal } from './components/ProductFormModal';
import { AddStockModal } from './components/AddStockModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';

import { DashboardPage } from './pages/DashboardPage';
import { NewBillPage } from './pages/NewBillPage';
import { ProductsPage } from './pages/ProductsPage';
import { AIOrderPage } from './pages/AIOrderPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Review1Page } from './pages/Review1Page';
import { StoreMapModal } from './components/StoreMapModal';
import {
  History,
  BarChart3,
  Settings as SettingsIcon,
  X,
  Sparkles,
  Award,
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(getStoredSettings());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAiDemoMode, setIsAiDemoMode] = useState<boolean>(true);

  // Modals state
  const [isFindProductOpen, setIsFindProductOpen] = useState(false);
  const [isStoreMapOpen, setIsStoreMapOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Initialize data and listeners
  const loadData = useCallback(() => {
    setProducts(getStoredProducts());
    setTransactions(getStoredTransactions());
    setSettings(getStoredSettings());
  }, []);

  useEffect(() => {
    loadData();

    // Check backend AI availability
    fetch('/api/ai/parse-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderText: 'test', catalog: [] }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsAiDemoMode(data.source !== 'gemini_live');
      })
      .catch(() => {
        setIsAiDemoMode(true);
      });

    // Custom events from storage service
    const handleProductsUpdate = () => setProducts(getStoredProducts());
    const handleTxUpdate = () => setTransactions(getStoredTransactions());
    const handleSettingsUpdate = () => setSettings(getStoredSettings());

    window.addEventListener('smartcounter_products_updated', handleProductsUpdate);
    window.addEventListener('smartcounter_transactions_updated', handleTxUpdate);
    window.addEventListener('smartcounter_settings_updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('smartcounter_products_updated', handleProductsUpdate);
      window.removeEventListener('smartcounter_transactions_updated', handleTxUpdate);
      window.removeEventListener('smartcounter_settings_updated', handleSettingsUpdate);
    };
  }, [loadData]);

  // Apply dark mode class to html document
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Global counter hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in form inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFindProductOpen(true);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsStoreMapOpen(true);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setActiveTab('review1');
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveTab('new-bill');
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setActiveTab('ai-order');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme as 'light' | 'dark' };
    saveSettings(updated);
  };

  const handleOpenAddStock = (product: Product) => {
    setSelectedProductForStock(product);
    setIsAddStockOpen(true);
  };

  const handleConfirmAddStock = (productId: string, units: number) => {
    addStockUnits(productId, units);
  };

  const handleOpenEditProduct = (product: Product) => {
    setProductToEdit(product);
    setIsProductFormOpen(true);
  };

  const handleOpenNewProduct = () => {
    setProductToEdit(null);
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (
    productData: Omit<Product, 'id'>,
    existingId?: string
  ) => {
    saveProduct(productData, existingId);
  };

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId);
  };

  const handleSelectProductForDetails = (product: Product) => {
    setSelectedProductForDetails(product);
    setIsProductDetailsOpen(true);
  };

  const handleSelectTransactionForReceipt = (tx: Transaction) => {
    setActiveReceiptTransaction(tx);
    setIsReceiptOpen(true);
  };

  const handleAddProductToBill = (product: Product) => {
    const existing = cart.find((i) => i.product.id === product.id);
    if (existing) {
      if (existing.quantity < product.stockQuantity) {
        setCart(
          cart.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        );
      }
    } else {
      if (product.stockQuantity > 0) {
        setCart([...cart, { product, quantity: 1 }]);
      }
    }
    setActiveTab('new-bill');
  };

  const handleTransferAiItemsToBill = (aiItems: CartItem[]) => {
    // Merge ai items into cart
    const merged = [...cart];
    for (const newItem of aiItems) {
      const idx = merged.findIndex((i) => i.product.id === newItem.product.id);
      if (idx > -1) {
        merged[idx].quantity = Math.min(
          merged[idx].product.stockQuantity,
          merged[idx].quantity + newItem.quantity
        );
      } else {
        merged.push({
          product: newItem.product,
          quantity: Math.min(newItem.product.stockQuantity, newItem.quantity),
        });
      }
    }
    setCart(merged);
    setTimeout(() => setActiveTab('new-bill'), 200);
  };

  const handleCompleteBill = (params: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
  }) => {
    // 1. Deduct stock
    const deductionSuccess = deductStockForBill(
      params.items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
      }))
    );

    if (!deductionSuccess) {
      alert('Error updating stock. Please check product quantities.');
      return;
    }

    // 2. Save transaction
    const newTx = saveTransaction({
      items: params.items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        brand: i.product.brand,
        category: i.product.category,
        quantity: i.quantity,
        unitPrice: i.product.price,
        totalPrice: i.product.price * i.quantity,
        rack: i.product.rack,
        shelf: i.product.shelf,
      })),
      subtotal: params.subtotal,
      discount: params.discount,
      grandTotal: params.grandTotal,
      paymentMethod: params.paymentMethod,
    });

    // 3. Clear cart
    setCart([]);

    // 4. Open thermal receipt modal
    setActiveReceiptTransaction(newTx);
    setIsReceiptOpen(true);
  };

  const lowStockCount = products.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  ).length;

  return (
    <div className="min-h-screen bg-stone-100/70 font-sans text-stone-900 transition-colors dark:bg-stone-950 dark:text-stone-100 flex flex-col pb-20 lg:pb-0">
      {/* Top Universal App Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        lowStockCount={lowStockCount}
        isAiDemoMode={isAiDemoMode}
        onNavigate={setActiveTab}
        onOpenFindProduct={() => setIsFindProductOpen(true)}
        onOpenStoreMap={() => setIsStoreMapOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Responsive Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          lowStockCount={lowStockCount}
          settings={settings}
        />

        {/* Dynamic Main Workspace Content */}
        <main
          id="main-workspace-scroll"
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
        >
          <div className="mx-auto max-w-6xl">
            {activeTab === 'dashboard' && (
              <DashboardPage
                products={products}
                transactions={transactions}
                settings={settings}
                onNavigate={setActiveTab}
                onSelectProduct={handleSelectProductForDetails}
                onSelectTransaction={handleSelectTransactionForReceipt}
                onOpenAddStock={handleOpenAddStock}
                onOpenStoreMap={() => setIsStoreMapOpen(true)}
              />
            )}

            {activeTab === 'new-bill' && (
              <NewBillPage
                products={products}
                settings={settings}
                cart={cart}
                onUpdateCart={setCart}
                onCompleteBill={handleCompleteBill}
                onNavigateToAiOrder={() => setActiveTab('ai-order')}
              />
            )}

            {activeTab === 'products' && (
              <ProductsPage
                products={products}
                settings={settings}
                onOpenAddProduct={handleOpenNewProduct}
                onSelectProduct={handleSelectProductForDetails}
                onOpenAddStock={handleOpenAddStock}
                onEditProduct={handleOpenEditProduct}
              />
            )}

            {activeTab === 'ai-order' && (
              <AIOrderPage
                products={products}
                settings={settings}
                onTransferToBill={handleTransferAiItemsToBill}
                onOpenFindProduct={() => setIsFindProductOpen(true)}
                onOpenStoreMap={() => setIsStoreMapOpen(true)}
              />
            )}

            {activeTab === 'sales-history' && (
              <SalesHistoryPage
                transactions={transactions}
                settings={settings}
                onSelectTransaction={handleSelectTransactionForReceipt}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPage
                products={products}
                transactions={transactions}
                settings={settings}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                settings={settings}
                onUpdateSettings={saveSettings}
                onResetDatabase={resetToSeedData}
                isAiDemoMode={isAiDemoMode}
              />
            )}

            {activeTab === 'review1' && (
              <Review1Page
                products={products}
                settings={settings}
                onNavigate={setActiveTab}
                onOpenStoreMap={() => setIsStoreMapOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Touch-Friendly Bottom Bar */}
      <BottomNav
        activeTab={activeTab}
        onNavigate={setActiveTab}
        lowStockCount={lowStockCount}
        onOpenMoreMenu={() => setIsMoreMenuOpen(true)}
      />

      {/* Mobile "More" Drawer Modal */}
      {isMoreMenuOpen && (
        <div
          id="mobile-more-menu-backdrop"
          className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl border-t border-stone-200 bg-white p-5 shadow-2xl transition-colors dark:border-stone-800 dark:bg-stone-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Additional Store Tools
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('sales-history');
                  setIsMoreMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Sales History & Invoices</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('analytics');
                  setIsMoreMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Sales Analytics</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsMoreMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <SettingsIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Shop Settings</span>
              </button>

              <button
                onClick={() => {
                  setIsStoreMapOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-xs font-bold text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <span className="text-base">🗺️</span>
                <span>MSN Stores 2D Map</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('review1');
                  setIsMoreMenuOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>Review 1 Project Dossier (45%)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Find Product Modal */}
      <FindProductModal
        isOpen={isFindProductOpen}
        onClose={() => setIsFindProductOpen(false)}
        products={products}
        onAddToBill={handleAddProductToBill}
        currencySymbol={settings.currencySymbol}
      />

      {/* Interactive 2D Store Map & Pathfinder Modal */}
      <StoreMapModal
        isOpen={isStoreMapOpen}
        onClose={() => setIsStoreMapOpen(false)}
        highlightedItems={products}
      />

      {/* Add Stock Quick Modal */}
      <AddStockModal
        isOpen={isAddStockOpen}
        product={selectedProductForStock}
        onClose={() => {
          setIsAddStockOpen(false);
          setSelectedProductForStock(null);
        }}
        onConfirmAdd={handleConfirmAddStock}
      />

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isProductFormOpen}
        productToEdit={productToEdit}
        onClose={() => {
          setIsProductFormOpen(false);
          setProductToEdit(null);
        }}
        onSave={handleSaveProduct}
        currencySymbol={settings.currencySymbol}
      />

      {/* Product Details & Location Modal */}
      <ProductDetailsModal
        isOpen={isProductDetailsOpen}
        product={selectedProductForDetails}
        currencySymbol={settings.currencySymbol}
        onClose={() => {
          setIsProductDetailsOpen(false);
          setSelectedProductForDetails(null);
        }}
        onEdit={handleOpenEditProduct}
        onAddStock={handleOpenAddStock}
        onDelete={handleDeleteProduct}
        onAddToBill={handleAddProductToBill}
      />

      {/* Thermal Slip Receipt Modal */}
      <BillReceiptModal
        isOpen={isReceiptOpen}
        transaction={activeReceiptTransaction}
        settings={settings}
        onClose={() => {
          setIsReceiptOpen(false);
          setActiveReceiptTransaction(null);
        }}
        onStartNewBill={() => {
          setActiveTab('new-bill');
        }}
      />
    </div>
  );
}
