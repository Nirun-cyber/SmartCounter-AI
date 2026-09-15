import { FC, useState, FormEvent } from 'react';
import {
  Settings,
  Store,
  Save,
  RotateCcw,
  Moon,
  Sun,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Phone,
  Sparkles,
} from 'lucide-react';
import { ShopSettings } from '../types';

interface SettingsPageProps {
  settings: ShopSettings;
  onUpdateSettings: (newSettings: ShopSettings) => void;
  onResetDatabase: () => void;
  isAiDemoMode: boolean;
}

export const SettingsPage: FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetDatabase,
  isAiDemoMode,
}) => {
  const [shopName, setShopName] = useState(settings.shopName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [shopkeeperName, setShopkeeperName] = useState(settings.shopkeeperName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      shopName: shopName.trim() || 'Gupta General Store',
      tagline: tagline.trim(),
      shopkeeperName: shopkeeperName.trim() || 'Ramesh Gupta',
      address: address.trim(),
      phone: phone.trim(),
      currencySymbol: currencySymbol.trim() || '₹',
      receiptFooter: receiptFooter.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div id="settings-page" className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          Store Settings
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Configure shop name, receipt print headers, AI engine and database backups
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Shop settings saved successfully.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900 sm:p-6 space-y-4"
      >
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Store className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-black text-stone-900 dark:text-white">
            Shop Profile & Counter Identification
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Shop Name
            </label>
            <input
              id="input-settings-shop-name"
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Tagline
            </label>
            <input
              id="input-settings-tagline"
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Shopkeeper Name
            </label>
            <input
              id="input-settings-shopkeeper-name"
              type="text"
              value={shopkeeperName}
              onChange={(e) => setShopkeeperName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Contact Phone
            </label>
            <input
              id="input-settings-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
            Address (Printed on receipts)
          </label>
          <input
            id="input-settings-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Currency Symbol
            </label>
            <input
              id="input-settings-currency"
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              Receipt Bottom Message
            </label>
            <input
              id="input-settings-receipt-footer"
              type="text"
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            id="btn-save-settings"
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* AI Engine Status Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-black text-stone-900 dark:text-white">
            Gemini AI Engine & NLP Integration
          </h2>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-800/60">
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">
                Active Extraction Engine
              </p>
              <p className="text-[11px] text-stone-400">
                {isAiDemoMode
                  ? 'Intelligent Client-Side NLP Matcher with Token Parser'
                  : 'Google Gemini 3.8 Flash (Server-Side @google/genai SDK)'}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isAiDemoMode
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {isAiDemoMode ? 'Demo Mode Active' : 'Gemini Connected'}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            In compliance with security standards, the Gemini API key is managed securely server-side in <code>server.ts</code>. If an external API key is not configured in <code>.env</code>, SmartCounter AI seamlessly switches to the rule-based entity extractor and phonetic catalog matcher so your counter operations are never blocked.
          </p>
        </div>
      </div>

      {/* Database Reset Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <RotateCcw className="h-4 w-4 text-rose-600" />
          <h2 className="text-sm font-black text-stone-900 dark:text-white">
            Reset Demo Prototype Database
          </h2>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-stone-900 dark:text-white">
              Restore Initial Demo Catalog & Stock
            </p>
            <p className="text-[11px] text-stone-400">
              Resets all 15 grocery products, rack locations, and seed transactions in LocalStorage.
            </p>
          </div>

          {confirmReset ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-reset-db"
                onClick={() => {
                  onResetDatabase();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Reset Everything
              </button>
            </div>
          ) : (
            <button
              id="btn-trigger-reset-db"
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Database</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
