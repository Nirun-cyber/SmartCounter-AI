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

// AI Order Parser Route
app.post("/api/ai/parse-order", async (req, res) => {
  try {
    const { orderText, catalog } = req.body;

    if (!orderText || typeof orderText !== "string") {
      return res.status(400).json({ error: "Missing or invalid orderText parameter" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        success: true,
        source: "demo_fallback",
        message: "Gemini API key not configured. Using simulated NLP entity extraction.",
        rawExtraction: null,
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

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
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
    let parsedItems = [];
    try {
      parsedItems = JSON.parse(text);
    } catch {
      parsedItems = [];
    }

    return res.json({
      success: true,
      source: "gemini_live",
      items: parsedItems,
      model: "gemini-3.8-flash",
    });
  } catch (error: any) {
    console.error("Gemini order parsing error:", error);
    return res.json({
      success: true,
      source: "demo_fallback",
      error: error?.message || "Gemini processing failed",
      rawExtraction: null,
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
