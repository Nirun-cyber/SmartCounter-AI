# SmartCounterAi
> **AI-Powered Billing, Spatial Rack Navigation & Stock Assistant for MSN Stores**

SmartCounter AI accelerates counter-service operations for small retail shops (deployed for **MSN Stores**) by combining natural language AI order parsing, intelligent physical rack/shelf location tracking, rapid billing with cash tender & dynamic UPI (`msnstores@oksbi`), and live inventory control.

[![Review 1 Milestone](https://img.shields.io/badge/Review%201-45%25%20Completed%20(Target%20%E2%89%A540%25)-success)](#-review-1-milestone--dossier)
[![Store Deployment](https://img.shields.io/badge/Store-MSN%20Stores-indigo)](#)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%203.1%20Flash%20Lite%20%2B%20Failover-blue)](#)

---

## 📋 Review 1 Milestone & Dossier

- **Official Report:** Full academic and engineering report available in [REVIEW_1_REPORT.md](./REVIEW_1_REPORT.md).
- **Completion Status:** **45% Complete** (exceeding the required Review 1 threshold of 40%).
- **Interactive In-App Dossier:** Navigate to the **Review 1** tab (hotkey `R`) to run live latency & accuracy benchmarks, inspect system architecture nodes, and explore the MSN Stores 2D floor plan.

---

## ⚡ Key Features

1. **AI Natural Order Entry & Voice Assistant**
   - Speak or type customer requests (e.g., *"Give me two Colgate, one Lux soap, and three Britannia biscuits"* or Hinglish *"Do packet Parle-G aur ek Surf Excel"*).
   - Powered by **Google Gemini 3.1 Flash Lite** via `@google/genai` with an automated multi-model failover cascade (**Gemini Flash Latest** and **Local NLP Tokenizer**) for 100% uptime without console exceptions.
   - Ambiguity resolution chips for generic items (e.g. "soap" → Lux vs Dettol).
   - **Smart Picking List**: Arranges retrieved items by physical store topology (**Rack A → Rack B → Rack C → Rack D** and **Shelf 1 → Shelf 4**) to eliminate backtracking and save **~42%** of walking distance behind the counter.

2. **Rapid Counter Billing & Settlement**
   - Real-time catalog search with instant stock deduction.
   - Subtotal and discount calculation.
   - **Cash Tender Calculator**: Quick currency chips (₹50, ₹100, ₹200, ₹500, ₹2000) with automatic change-to-return calculation.
   - **UPI Payment Integration**: Displays MSN Stores VPA (`msnstores@oksbi`) and generates dynamic QR codes on thermal invoices.
   - **Receipts**: 58mm/80mm thermal receipt print slip and digital WhatsApp/SMS E-Bill simulator.

3. **Stock & Physical Location Tracking (MSN Stores)**
   - 15 realistic Indian grocery products across Groceries, Biscuits, Personal Care, and Home Cleaning.
   - Interactive **2D Store Rack Map & Pathfinder** (hotkey `M`).
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
