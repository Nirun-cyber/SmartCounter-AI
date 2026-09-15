import { Product, ShopSettings, Transaction, TransactionItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_TRANSACTIONS } from '../data/seedData';

const STORAGE_KEYS = {
  PRODUCTS: 'smartcounter_products_v1',
  TRANSACTIONS: 'smartcounter_transactions_v1',
  SETTINGS: 'smartcounter_settings_v1',
};

// Initialize Storage if empty
export function initStorage(): void {
  try {
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }
  } catch (err) {
    console.error('LocalStorage init error:', err);
  }
}

// Products API
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      initStorage();
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse stored products:', err);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('smartcounter_products_updated', { detail: products }));
  } catch (err) {
    console.error('Failed to save products:', err);
  }
}

export function addProduct(newProd: Omit<Product, 'id'>): Product {
  const products = getStoredProducts();
  const nextNum = products.length + 1;
  const id = `PRD-${String(nextNum).padStart(3, '0')}`;
  const created: Product = {
    ...newProd,
    id,
    lastRestocked: new Date().toISOString(),
  };
  const updated = [created, ...products];
  saveStoredProducts(updated);
  return created;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updatedProd = { ...products[index], ...updates };
  products[index] = updatedProd;
  saveStoredProducts(products);
  return updatedProd;
}

export function deleteProduct(id: string): boolean {
  const products = getStoredProducts();
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  saveStoredProducts(filtered);
  return true;
}

export function addStock(id: string, amount: number): Product | null {
  const products = getStoredProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = products[index];
  const newStock = Math.max(0, current.stockQuantity + amount);
  const updatedProd = {
    ...current,
    stockQuantity: newStock,
    lastRestocked: new Date().toISOString(),
  };
  products[index] = updatedProd;
  saveStoredProducts(products);
  return updatedProd;
}

export function deductStockForBill(items: { productId: string; quantity: number }[]): {
  success: boolean;
  error?: string;
} {
  const products = getStoredProducts();
  const productMap = new Map<string, Product>();
  products.forEach((p) => productMap.set(p.id, p));

  // 1. Validate all stock first
  for (const item of items) {
    const p = productMap.get(item.productId);
    if (!p) {
      return { success: false, error: `Product ID ${item.productId} not found in catalog` };
    }
    if (p.stockQuantity < item.quantity) {
      return {
        success: false,
        error: `Insufficient stock for "${p.name}". Requested: ${item.quantity}, Available: ${p.stockQuantity}`,
      };
    }
  }

  // 2. Apply deductions
  const updatedProducts = products.map((p) => {
    const match = items.find((it) => it.productId === p.id);
    if (match) {
      return {
        ...p,
        stockQuantity: p.stockQuantity - match.quantity,
      };
    }
    return p;
  });

  saveStoredProducts(updatedProducts);
  return { success: true };
}

// Transactions API
export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      initStorage();
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse transactions:', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    window.dispatchEvent(new CustomEvent('smartcounter_transactions_updated', { detail: transactions }));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

export function recordNewTransaction(params: {
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'UPI';
  customerName?: string;
  notes?: string;
}): Transaction {
  const transactions = getStoredTransactions();
  const highestBillNumber = transactions.reduce(
    (max, t) => Math.max(max, t.billNumber || 1000),
    1042
  );
  const nextBillNumber = highestBillNumber + 1;
  const transactionId = `BILL-${nextBillNumber}`;

  const transaction: Transaction = {
    id: transactionId,
    billNumber: nextBillNumber,
    timestamp: new Date().toISOString(),
    items: params.items,
    subtotal: params.subtotal,
    discount: params.discount,
    grandTotal: params.grandTotal,
    paymentMethod: params.paymentMethod,
    customerName: params.customerName,
    notes: params.notes,
    status: 'completed',
  };

  const updated = [transaction, ...transactions];
  saveStoredTransactions(updated);
  return transaction;
}

// Settings API
export function getStoredSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      initStorage();
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Failed to parse settings:', err);
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('smartcounter_settings_updated', { detail: settings }));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Reset & Backup
export function saveProduct(productData: Omit<Product, 'id'>, existingId?: string): Product {
  if (existingId) {
    const updated = updateProduct(existingId, productData);
    if (updated) return updated;
  }
  return addProduct(productData);
}

export const addStockUnits = addStock;
export const saveTransaction = recordNewTransaction;
export const saveSettings = saveStoredSettings;
export function resetToDemoData(): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
  window.dispatchEvent(new CustomEvent('smartcounter_products_updated', { detail: INITIAL_PRODUCTS }));
  window.dispatchEvent(new CustomEvent('smartcounter_transactions_updated', { detail: INITIAL_TRANSACTIONS }));
  window.dispatchEvent(new CustomEvent('smartcounter_settings_updated', { detail: INITIAL_SETTINGS }));
}

export const resetToSeedData = resetToDemoData;



export function exportBackupData(): string {
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: getStoredProducts(),
      transactions: getStoredTransactions(),
      settings: getStoredSettings(),
    },
    null,
    2
  );
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed.products)) return false;
    saveStoredProducts(parsed.products);
    if (Array.isArray(parsed.transactions)) {
      saveStoredTransactions(parsed.transactions);
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      saveStoredSettings(parsed.settings);
    }
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}
