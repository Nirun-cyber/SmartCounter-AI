# SmartCounterAi
> **AI-Powered Billing & Stock Assistant for Small Retail Stores**

SmartCounter AI accelerates counter-service operations for small retail shops by combining natural language AI order parsing, intelligent physical rack/shelf location tracking, rapid billing, and live inventory control.

---

## ⚡ Key Features

1. **AI Natural Order Entry & Voice Assistant**
   - Speak or type customer requests (e.g., *"Give me two Colgate, one Lux soap, and three Britannia biscuits"*).
   - Powered by Gemini 3.8 Flash via `@google/genai` with a client-side NLP token fallback.
   - Ambiguity resolution for multi-variant products.
   - **Smart Picking List**: Automatically arranges retrieved items by physical store location (**Rack A → Rack B → Rack C** and **Shelf 1 → Shelf 2**) to minimize cashier walking distance behind the counter.

2. **Rapid Counter Billing**
   - Real-time catalog search with instant stock deduction.
   - Subtotal, discount calculation, and Cash / UPI payment handling.
   - Instant thermal receipt generation and printable slips.

3. **Stock & Location Tracking**
   - 15 realistic Indian grocery products across Groceries, Biscuits, Personal Care, and Home Cleaning.
   - Interactive Store Rack Map matrix visualizer.
   - Low-stock warnings and quick `+ Add Stock` unit chips (+5, +10, +20, +50).
   - Instant "Find Product" shortcut (`F` key) for looking up exact rack & shelf coordinates.

4. **Sales History & Analytics**
   - Audit trail of completed bills with Cash/UPI filters.
   - Revenue overview, average bill value, top-selling products, and payment mode breakdown.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
- **AI & Processing**: Google Gemini API (`@google/genai`) via secure server proxy + Fallback NLP Matcher
- **Backend**: Express.js server (`server.ts`)
- **Persistence**: LocalStorage with CustomEvent synchronization

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
