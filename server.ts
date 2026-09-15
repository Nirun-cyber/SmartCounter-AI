import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy GoogleGenAI client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health & Status check
app.get("/api/health", (req, res) => {
  const ai = getGeminiClient();
  res.json({
    status: "ok",
    hasApiKey: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Number word parser for server-side rule fallback
const NUMBER_WORDS_SERVER: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  a: 1, an: 1, ek: 1, do: 2, teen: 3, char: 4, paanch: 5, dozen: 12
};

function serverFallbackExtraction(orderText: string): any[] {
  const clean = orderText.toLowerCase().replace(/[.,?!]/g, ' ');
  const clauses = clean.split(/\b(?:and also|and|plus|aur|with|also|,)\b/).map(c => c.trim()).filter(Boolean);
  const items: any[] = [];

  for (const clause of clauses) {
    let text = clause;
    let quantity = 1;
    const numMatch = text.match(/\b(\d+)\b/);
    if (numMatch) {
      quantity = parseInt(numMatch[1], 10);
      text = text.replace(numMatch[0], ' ').trim();
    } else {
      for (const [word, val] of Object.entries(NUMBER_WORDS_SERVER)) {
        const r = new RegExp(`\\b${word}\\b`, 'i');
        if (r.test(text)) {
          quantity = val;
          text = text.replace(r, ' ').trim();
          break;
        }
      }
    }

    const stripped = text
      .replace(/\b(?:give me|please give|i want|pack|packs|packet|packets|tube|tubes|bar|bars|bottle|bottles|box|boxes|piece|pieces|of|item|items|kilo|kg|gm|gram)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (stripped) {
      items.push({
        productName: stripped,
        quantity: Math.max(1, quantity),
      });
    }
  }

  return items;
}

// AI Order Parser Route with resilient multi-model failover
app.post("/api/ai/parse-order", async (req, res) => {
  try {
    const { orderText, catalog } = req.body;

    if (!orderText || typeof orderText !== "string") {
      return res.status(400).json({ error: "Missing or invalid orderText parameter" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackItems = serverFallbackExtraction(orderText);
      return res.json({
        success: true,
        source: "demo_fallback",
        items: fallbackItems,
        message: "Gemini API key not configured. Using rule-based entity extraction.",
      });
    }

    // Catalog summary to provide grounded context to Gemini
    const catalogSummary = Array.isArray(catalog)
      ? catalog
          .map((p: any) => `- ID: ${p.id} | Name: ${p.name} | Brand: ${p.brand} | Category: ${p.category} | Price: ₹${p.price} | Stock: ${p.stockQuantity} | Rack: ${p.rack}, Shelf: ${p.shelf}`)
          .slice(0, 50)
          .join("\n")
      : "";

    const systemInstruction = `You are an expert NLP order understanding assistant for a small retail counter-service shop (SmartCounter AI).
Your task is to extract product requests from customer speech or text.
Extract:
1. productName (the core product mention, e.g. "Colgate", "Lux", "Britannia Biscuits", "Aashirvaad Atta")
2. quantity (integer, defaults to 1 if not specified)
3. brand (brand name if detected, e.g. "Colgate", "Lux", "Britannia")
4. attributes (packaging, size, or attributes, e.g. "soap", "toothpaste", "1kg", "packet")

IMPORTANT RULES:
- Never invent products.
- Return structured JSON array.
- Understand number words (e.g., "two", "three", "half dozen" = 6, "ek", "do", "teen").
- The shopkeeper will match your extracted items with the shop inventory.`;

    const prompt = `Available Shop Catalog:\n${catalogSummary}\n\nCustomer Order: "${orderText}"\n\nExtract all requested items as a JSON list.`;

    // Resilient model fallback candidate list:
    // 'gemini-3.1-flash-lite' is fast and has high capacity; fallback to 'gemini-flash-latest' and 'gemini-3.8-flash'
    const candidateModels = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.8-flash"];
    let parsedItems: any[] = [];
    let successfulModel = "";

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.1,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              description: "List of extracted product items from customer order",
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: {
                    type: Type.STRING,
                    description: "Name of the requested product",
                  },
                  quantity: {
                    type: Type.INTEGER,
                    description: "Quantity requested (positive integer)",
                  },
                  brand: {
                    type: Type.STRING,
                    description: "Brand name if identified",
                  },
                  attributes: {
                    type: Type.STRING,
                    description: "Packaging or size attributes (e.g. soap, 100g)",
                  },
                },
                required: ["productName", "quantity"],
              },
            },
          },
        });

        const text = response.text || "[]";
        parsedItems = JSON.parse(text);
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          successfulModel = model;
          break;
        }
      } catch (err: any) {
        // Log warning and try next candidate model without throwing
        console.warn(`Model ${model} unavailable (${err?.status || err?.message || 'demand spike'}), trying fallback...`);
      }
    }

    if (successfulModel && parsedItems.length > 0) {
      return res.json({
        success: true,
        source: "gemini_live",
        items: parsedItems,
        model: successfulModel,
      });
    }

    // If all remote models were busy, use local rule extraction seamlessly
    const fallbackItems = serverFallbackExtraction(orderText);
    return res.json({
      success: true,
      source: "demo_fallback",
      items: fallbackItems,
      message: "Remote models busy; resolved order via resilient local NLP extractor.",
    });
  } catch (error: any) {
    console.warn("Recovered from order parsing exception:", error?.message);
    const fallbackItems = serverFallbackExtraction(req.body?.orderText || "");
    return res.json({
      success: true,
      source: "demo_fallback",
      items: fallbackItems,
      error: error?.message || "Processed via fallback",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCounter AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
