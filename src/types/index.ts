export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  stockQuantity: number;
  lowStockThreshold: number;
  rack: string;
  shelf: string;
  description: string;
  barcode?: string;
  unit?: string;
  image?: string;
  lastRestocked?: string;
}

export type ProductCategory =
  | 'Groceries'
  | 'Biscuits'
  | 'Beverages'
  | 'Personal Care'
  | 'Home Cleaning'
  | 'Snacks'
  | 'Stationery'
  | 'Fancy Items';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  brand: string;
  category: ProductCategory;
  rack: string;
  shelf: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'Cash' | 'UPI';

export interface Transaction {
  id: string;
  billNumber: number;
  timestamp: string; // ISO string
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  status: 'completed' | 'cancelled';
  notes?: string;
}

export interface AIOrderItem {
  rawMention: string;
  requestedName: string;
  requestedQuantity: number;
  requestedBrand?: string;
  attributes?: string;
  status: 'matched' | 'ambiguous' | 'not_found';
  matchedProduct?: Product;
  candidateProducts?: Product[];
  confidence: 'high' | 'medium' | 'low';
  collected?: boolean;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  shopkeeperName: string;
  phone: string;
  address: string;
  currencySymbol: string;
  upiId: string;
  theme: 'light' | 'dark';
  enableSound: boolean;
  receiptFooter: string;
}

export interface PickingItem {
  itemIndex: number;
  product: Product;
  quantity: number;
  rack: string;
  shelf: string;
  collected: boolean;
}

export type ActiveTab =
  | 'dashboard'
  | 'new-bill'
  | 'products'
  | 'ai-order'
  | 'sales-history'
  | 'analytics'
  | 'settings';
