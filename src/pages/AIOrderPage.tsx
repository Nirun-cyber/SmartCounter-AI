import { FC, useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  MapPin,
  RefreshCw,
  ShoppingCart,
  Zap,
  Cpu,
  Search,
  Check,
} from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import {
  parseCustomerOrder,
  generateSmartPickingList,
  ParseOrderResult,
} from '../services/aiOrderService';
import { AIOrderItem, CartItem, PickingItem, Product, ShopSettings } from '../types';

interface AIOrderPageProps {
  products: Product[];
  settings: ShopSettings;
  onTransferToBill: (items: CartItem[]) => void;
  onOpenFindProduct: () => void;
  onOpenStoreMap?: () => void;
}

const SAMPLE_ORDERS = [
  'Give me two Colgate, one Lux soap, and three Britannia biscuits',
  '3 Maggi, 2 Parle-G, and 1 Surf Excel',
  '1 Aashirvaad Atta, 2 Tata Tea and 1 Dettol liquid',
  'Do packet Parle-G aur ek Surf Excel',
  '2 soap and 1 biscuit', // Ambiguous demo
];

export const AIOrderPage: FC<AIOrderPageProps> = ({
  products,
  settings,
  onTransferToBill,
  onOpenFindProduct,
  onOpenStoreMap,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseOrderResult | null>(null);
  const [items, setItems] = useState<AIOrderItem[]>([]);
  const [pickingList, setPickingList] = useState<PickingItem[]>([]);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Sync voice transcript to input text
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  const handleParse = async (textToParse = inputText) => {
    if (!textToParse.trim()) return;
    setIsProcessing(true);
    setTransferSuccess(false);

    try {
      const result = await parseCustomerOrder(textToParse, products);
      setParseResult(result);
      setItems(result.items);
      const picking = generateSmartPickingList(result.items);
      setPickingList(picking);
    } catch (e) {
      console.error('Order parsing failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle item collected checkbox in picking list
  const togglePickingItemCollected = (index: number) => {
    setPickingList((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, collected: !item.collected } : item
      )
    );
  };

  // Resolve ambiguous candidate item
  const handleSelectCandidate = (itemIndex: number, chosenProduct: Product) => {
    const updated = [...items];
    updated[itemIndex] = {
      ...updated[itemIndex],
      status: 'matched',
      matchedProduct: chosenProduct,
      candidateProducts: undefined,
    };
    setItems(updated);
    setPickingList(generateSmartPickingList(updated));
  };

  // Transfer matched items to New Bill Cart
  const handleTransferToCart = () => {
    const matched = items.filter(
      (it): it is AIOrderItem & { matchedProduct: Product } =>
        it.status === 'matched' && it.matchedProduct !== undefined
    );

    if (matched.length === 0) return;

    const cartItems: CartItem[] = matched.map((it) => ({
      product: it.matchedProduct,
      quantity: it.requestedQuantity,
    }));

    onTransferToBill(cartItems);
    setTransferSuccess(true);
  };

  const matchedCount = items.filter((i) => i.status === 'matched').length;
  const ambiguousCount = items.filter((i) => i.status === 'ambiguous').length;
  const notFoundCount = items.filter((i) => i.status === 'not_found').length;

  return (
    <div id="ai-order-page" className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-white sm:text-3xl">
              AI Natural Order Entry
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Gemini 3.8 Flash + Fallback
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Listen to rapid counter requests, extract quantities, find shelf locations & organize walking path
          </p>
        </div>

        {parseResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputText('');
                setParseResult(null);
                setItems([]);
                setPickingList([]);
                resetTranscript();
              }}
              className="flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>New Order</span>
            </button>
          </div>
        )}
      </div>

      {/* Input Box Card */}
      <div
        id="ai-order-input-card"
        className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-stone-900"
      >
        <div className="flex items-center justify-between pb-2">
          <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
            Customer Request (Speech or Text)
          </label>
          <span className="text-[11px] text-stone-400">
            e.g. "Give me two Colgate, one Lux soap and three biscuits"
          </span>
        </div>

        <div className="relative mt-1">
          <textarea
            id="ai-order-textarea"
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Click 🎤 Speak Order or type what the customer asked for..."
            className="w-full rounded-xl border border-stone-300 bg-stone-50 p-3.5 text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />

          {/* Voice Listening Active Indicator */}
          {isListening && (
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-bold text-white shadow-sm animate-pulse">
              <span className="h-2 w-2 rounded-full bg-white animate-ping" />
              <span>Listening to customer...</span>
            </div>
          )}
        </div>

        {speechError && (
          <p className="mt-2 text-xs font-medium text-rose-500">
            {speechError}
          </p>
        )}

        {/* Action Controls */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mic Toggle Button */}
            <button
              id="btn-toggle-speech"
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-200'
                  : 'border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>🎤 Speak Order</span>
                </>
              )}
            </button>

            {inputText && (
              <button
                onClick={() => {
                  setInputText('');
                  resetTranscript();
                }}
                className="text-xs font-semibold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Parse Button */}
          <button
            id="btn-parse-ai-order"
            disabled={!inputText.trim() || isProcessing}
            onClick={() => handleParse()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Extracting with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Parse & Match Order</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-800">
          <span className="text-[11px] font-bold text-stone-400">
            Quick Test Prompts:
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLE_ORDERS.map((sample, idx) => (
              <button
                key={idx}
                id={`sample-prompt-${idx}`}
                onClick={() => {
                  setInputText(sample);
                  handleParse(sample);
                }}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-left text-xs font-medium text-stone-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:border-indigo-700"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parsing Results & Smart Picking Route */}
      {items.length > 0 && (
        <div className="space-y-6">
          {/* Status Overview Pill bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Extraction Results:
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ {matchedCount} Matched
              </span>
              {ambiguousCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ? {ambiguousCount} Needs Choice
                </span>
              )}
              {notFoundCount > 0 && (
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                  ✕ {notFoundCount} Unmatched
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Cpu className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                Engine: {parseResult?.source === 'gemini_live' ? 'Gemini 3.8 Flash' : 'Smart NLP Matcher'}
              </span>
              <span>•</span>
              <span>{parseResult?.latencyMs}ms</span>
            </div>
          </div>

          {/* 2-Column Split: Extracted Items Card & SMART PICKING ROUTE */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: AI Extracted Order Items (6 cols) */}
            <div className="space-y-3 lg:col-span-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-stone-700 dark:text-stone-300">
                  Extracted Items ({items.length})
                </h3>
                <span className="text-xs text-stone-400">Inventory Status</span>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  if (item.status === 'matched' && item.matchedProduct) {
                    const prod = item.matchedProduct;
                    const isOut = prod.stockQuantity === 0;
                    const isLow = prod.stockQuantity <= prod.lowStockThreshold && !isOut;

                    return (
                      <div
                        key={idx}
                        id={`ai-item-matched-${idx}`}
                        className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 transition dark:border-emerald-900/60 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-xs font-black text-white">
                              {item.requestedQuantity}x
                            </span>
                            <span className="truncate text-sm font-bold text-stone-900 dark:text-white">
                              {prod.name}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                            <span>
                              {settings.currencySymbol}
                              {prod.price * item.requestedQuantity} (
                              {settings.currencySymbol}
                              {prod.price} ea)
                            </span>
                            <span>•</span>
                            {isOut ? (
                              <span className="font-bold text-rose-600">
                                0 in stock!
                              </span>
                            ) : isLow ? (
                              <span className="font-bold text-amber-600">
                                Only {prod.stockQuantity} in stock
                              </span>
                            ) : (
                              <span className="text-emerald-700 dark:text-emerald-300">
                                {prod.stockQuantity} in stock
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Location Tag */}
                        <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs font-bold text-indigo-900 dark:border-indigo-800 dark:bg-stone-800 dark:text-indigo-200">
                          <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                          <span>
                            {prod.rack} → {prod.shelf}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  if (item.status === 'ambiguous') {
                    return (
                      <div
                        key={idx}
                        id={`ai-item-ambiguous-${idx}`}
                        className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/20"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-200">
                          <HelpCircle className="h-4 w-4 text-amber-600" />
                          <span>
                            Ambiguous: {item.requestedQuantity}x "{item.requestedName}"
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                          Multiple matching products found. Which one did the customer want?
                        </p>

                        {/* Candidates selector */}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {item.candidateProducts?.map((cand) => (
                            <button
                              key={cand.id}
                              onClick={() => handleSelectCandidate(idx, cand)}
                              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-800 shadow-2xs hover:bg-amber-50 active:scale-95 dark:border-amber-700 dark:bg-stone-800 dark:text-stone-200"
                            >
                              <span>{cand.name}</span>
                              <span className="text-stone-400">
                                ({settings.currencySymbol}
                                {cand.price})
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // Not found
                  return (
                    <div
                      key={idx}
                      id={`ai-item-unmatched-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3.5 dark:border-stone-800 dark:bg-stone-800/50"
                    >
                      <div>
                        <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                          Could not match: "{item.requestedName}" ({item.requestedQuantity}x)
                        </p>
                        <p className="text-[11px] text-stone-400">
                          Item name not found in current inventory.
                        </p>
                      </div>

                      <button
                        onClick={onOpenFindProduct}
                        className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Search Manually</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: SMART PICKING LIST (6 cols) */}
            <div className="space-y-3 lg:col-span-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wide text-stone-700 dark:text-stone-300">
                    Smart Picking Route
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {onOpenStoreMap && (
                    <button
                      id="btn-picking-map-view"
                      onClick={onOpenStoreMap}
                      className="flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    >
                      <span>🗺️ View Map Route</span>
                    </button>
                  )}
                  <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Rack & Shelf Optimized
                  </span>
                </div>
              </div>

              <div
                id="smart-picking-route-card"
                className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900"
              >
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-3">
                  Items sorted by physical rack and shelf position so the shopkeeper can gather items in one smooth walk behind the counter.
                </p>

                {pickingList.length === 0 ? (
                  <p className="py-6 text-center text-xs text-stone-400">
                    Resolve matched items to view picking route
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {pickingList.map((pick, pIdx) => (
                      <div
                        key={pIdx}
                        id={`picking-item-${pIdx}`}
                        onClick={() => togglePickingItemCollected(pIdx)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition ${
                          pick.collected
                            ? 'border-emerald-200 bg-emerald-50/50 opacity-60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                            : 'border-stone-200 bg-stone-50/60 hover:border-indigo-200 dark:border-stone-800 dark:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Collected Checkbox */}
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-lg border transition ${
                              pick.collected
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-stone-300 bg-white text-transparent dark:border-stone-600 dark:bg-stone-800'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  pick.collected
                                    ? 'line-through text-stone-400'
                                    : 'text-stone-900 dark:text-white'
                                }`}
                              >
                                {pick.quantity}x {pick.product.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400">
                              {pick.product.brand} • {settings.currencySymbol}
                              {pick.product.price} each
                            </span>
                          </div>
                        </div>

                        {/* Location Indicator */}
                        <div className="text-right">
                          <span className="inline-block rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-black text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                            {pick.rack} → {pick.shelf}
                          </span>
                          <p className="mt-0.5 text-[9px] text-stone-400">
                            Step #{pick.itemIndex}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Transfer Action Button */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                  <button
                    id="btn-transfer-ai-to-bill"
                    disabled={matchedCount === 0}
                    onClick={handleTransferToCart}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-black text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98] dark:bg-indigo-500 dark:hover:bg-indigo-600"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>
                      Move {matchedCount} Item{matchedCount !== 1 ? 's' : ''} to Bill Cart →
                    </span>
                  </button>

                  {transferSuccess && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Transferred to bill! Switching to New Bill...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
