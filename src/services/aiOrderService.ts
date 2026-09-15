import { AIOrderItem, PickingItem, Product } from '../types';

export interface ParseOrderResult {
  source: 'gemini_live' | 'demo_fallback';
  modelName?: string;
  items: AIOrderItem[];
  unmatchedQueries: string[];
  techniques: string[];
  latencyMs: number;
}

// Number word to integer mapping
const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  'half dozen': 6,
  dozen: 12,
  a: 1,
  an: 1,
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
};

/**
 * Intelligent Fallback NLP Tokenizer and Entity Extractor
 * Used when Gemini API key is not supplied or offline.
 */
export function extractEntitiesFallback(
  orderText: string,
  catalog: Product[]
): { productName: string; quantity: number; brand?: string; attributes?: string; raw: string }[] {
  const clean = orderText.toLowerCase().replace(/[\.,\?!\n]/g, ' ');

  // Split by common natural-language conjunctions
  const clauses = clean
    .split(/\b(?:and also|and|plus|aur|with|also|,)\b/)
    .map((c) => c.trim())
    .filter(Boolean);

  const results: { productName: string; quantity: number; brand?: string; attributes?: string; raw: string }[] = [];

  for (const clause of clauses) {
    let text = clause.trim();
    if (!text) continue;

    // 1. Detect quantity (e.g. "two colgate", "3 maggi", "colgate 2 packets", "1kg atta")
    let quantity = 1;
    let qtyMatch = text.match(/\b(\d+)\b/);
    if (qtyMatch) {
      quantity = parseInt(qtyMatch[1], 10);
      text = text.replace(qtyMatch[0], ' ').trim();
    } else {
      // Check word numbers
      for (const [word, num] of Object.entries(NUMBER_WORDS)) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(text)) {
          quantity = num;
          text = text.replace(regex, ' ').trim();
          break;
        }
      }
    }

    // Clean conversational filler words
    const strippedProduct = text
      .replace(/\b(?:give me|please give|i want|pack|packs|packet|packets|tube|tubes|bar|bars|bottle|bottles|box|boxes|piece|pieces|of|item|items|kilo|kg|gm|gram|soap|soaps|biscuit|biscuits|noodles|tea|coffee|pen|pens)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    results.push({
      productName: strippedProduct || clause,
      quantity: Math.max(1, quantity),
      raw: clause,
    });
  }

  return results;
}

/**
 * Product Matcher:
 * Compares an extracted query with the current inventory database.
 * Detects exact match, multiple matches (ambiguous), or not found.
 */
export function matchProductWithCatalog(
  query: string,
  catalog: Product[]
): {
  status: 'matched' | 'ambiguous' | 'not_found';
  matchedProduct?: Product;
  candidateProducts?: Product[];
  confidence: 'high' | 'medium' | 'low';
} {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return { status: 'not_found', confidence: 'low' };
  }

  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  // 1. Exact or near-exact name/brand matches
  const exactMatches = catalog.filter((p) => {
    const pName = p.name.toLowerCase();
    const pBrand = p.brand.toLowerCase();
    return pName === normalizedQuery || pName.includes(normalizedQuery) || normalizedQuery.includes(pName);
  });

  if (exactMatches.length === 1) {
    return {
      status: 'matched',
      matchedProduct: exactMatches[0],
      confidence: 'high',
    };
  }

  if (exactMatches.length > 1) {
    return {
      status: 'ambiguous',
      candidateProducts: exactMatches.slice(0, 5),
      confidence: 'medium',
    };
  }

  // 2. Token overlap & Brand match
  const scored = catalog.map((p) => {
    const pName = p.name.toLowerCase();
    const pBrand = p.brand.toLowerCase();
    const pCat = p.category.toLowerCase();

    let score = 0;
    if (pBrand && normalizedQuery.includes(pBrand)) score += 4;

    for (const word of queryWords) {
      if (pName.includes(word)) score += 3;
      else if (pBrand.includes(word)) score += 2;
      else if (pCat.includes(word)) score += 1;
    }

    return { product: p, score };
  });

  const validCandidates = scored.filter((s) => s.score >= 3).sort((a, b) => b.score - a.score);

  if (validCandidates.length === 1) {
    return {
      status: 'matched',
      matchedProduct: validCandidates[0].product,
      confidence: validCandidates[0].score >= 4 ? 'high' : 'medium',
    };
  }

  if (validCandidates.length > 1) {
    // If top score is substantially higher than second, pick top
    if (validCandidates[0].score >= validCandidates[1].score + 3) {
      return {
        status: 'matched',
        matchedProduct: validCandidates[0].product,
        confidence: 'medium',
      };
    }

    return {
      status: 'ambiguous',
      candidateProducts: validCandidates.map((c) => c.product).slice(0, 4),
      confidence: 'medium',
    };
  }

  return {
    status: 'not_found',
    confidence: 'low',
  };
}

/**
 * Main Order Parsing Pipeline:
 * Coordinates Speech/Text -> NLP Entity Extraction -> Product Catalog Matcher
 */
export async function parseCustomerOrder(
  orderText: string,
  catalog: Product[]
): Promise<ParseOrderResult> {
  const startTime = performance.now();
  const techniques = [
    'Speech Recognition (if voice used)',
    'NLP Order Understanding',
    'Entity Extraction',
    'Product Matching',
    'Rule-based Validation',
    'Picking-sequence Optimization',
  ];

  if (!orderText || !orderText.trim()) {
    return {
      source: 'demo_fallback',
      items: [],
      unmatchedQueries: [],
      techniques,
      latencyMs: 0,
    };
  }

  let extractedItems: {
    productName: string;
    quantity: number;
    brand?: string;
    attributes?: string;
    raw?: string;
  }[] = [];
  let source: 'gemini_live' | 'demo_fallback' = 'demo_fallback';
  let modelName: string | undefined = undefined;

  // Attempt server-side Gemini route first
  try {
    const catalogSummary = catalog.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      stockQuantity: p.stockQuantity,
      rack: p.rack,
      shelf: p.shelf,
    }));

    const response = await fetch('/api/ai/parse-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderText,
        catalog: catalogSummary,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.source === 'gemini_live' && Array.isArray(data.items) && data.items.length > 0) {
        source = 'gemini_live';
        modelName = data.model || 'gemini-3.8-flash';
        extractedItems = data.items.map((it: any) => ({
          productName: it.productName,
          quantity: typeof it.quantity === 'number' ? it.quantity : 1,
          brand: it.brand,
          attributes: it.attributes,
          raw: `${it.quantity || 1}x ${it.productName}`,
        }));
      }
    }
  } catch {
    // If backend route is unavailable or offline, use client-side intelligent NLP fallback
  }

  // If Gemini live didn't extract items, run intelligent fallback
  if (extractedItems.length === 0) {
    source = 'demo_fallback';
    extractedItems = extractEntitiesFallback(orderText, catalog);
  }

  // Now match against local product catalog
  const processedItems: AIOrderItem[] = [];
  const unmatched: string[] = [];

  for (const item of extractedItems) {
    const match = matchProductWithCatalog(item.productName, catalog);

    if (match.status === 'matched' && match.matchedProduct) {
      processedItems.push({
        rawMention: item.raw || `${item.quantity} ${item.productName}`,
        requestedName: item.productName,
        requestedQuantity: item.quantity,
        requestedBrand: item.brand,
        attributes: item.attributes,
        status: 'matched',
        matchedProduct: match.matchedProduct,
        confidence: match.confidence,
        collected: false,
      });
    } else if (match.status === 'ambiguous' && match.candidateProducts) {
      processedItems.push({
        rawMention: item.raw || `${item.quantity} ${item.productName}`,
        requestedName: item.productName,
        requestedQuantity: item.quantity,
        requestedBrand: item.brand,
        attributes: item.attributes,
        status: 'ambiguous',
        candidateProducts: match.candidateProducts,
        confidence: 'medium',
        collected: false,
      });
    } else {
      unmatched.push(item.productName);
      processedItems.push({
        rawMention: item.raw || `${item.quantity} ${item.productName}`,
        requestedName: item.productName,
        requestedQuantity: item.quantity,
        requestedBrand: item.brand,
        status: 'not_found',
        confidence: 'low',
        collected: false,
      });
    }
  }

  const endTime = performance.now();
  return {
    source,
    modelName,
    items: processedItems,
    unmatchedQueries: unmatched,
    techniques,
    latencyMs: Math.round(endTime - startTime),
  };
}

/**
 * Smart Picking Route Optimizer:
 * Sorts products by Rack (e.g. Rack A -> Rack B -> Rack C...) and Shelf (Shelf 1 -> Shelf 2...)
 * to reduce physical footsteps of the counter shopkeeper!
 */
export function generateSmartPickingList(items: AIOrderItem[]): PickingItem[] {
  const matched = items.filter(
    (it): it is AIOrderItem & { matchedProduct: Product } =>
      it.status === 'matched' && it.matchedProduct !== undefined
  );

  // Natural alphabetical sort on Rack and Shelf
  const sorted = [...matched].sort((a, b) => {
    const rackComp = a.matchedProduct.rack.localeCompare(b.matchedProduct.rack);
    if (rackComp !== 0) return rackComp;
    return a.matchedProduct.shelf.localeCompare(b.matchedProduct.shelf);
  });

  return sorted.map((it, idx) => ({
    itemIndex: idx + 1,
    product: it.matchedProduct,
    quantity: it.requestedQuantity,
    rack: it.matchedProduct.rack,
    shelf: it.matchedProduct.shelf,
    collected: it.collected || false,
  }));
}
