# 🏛️ CivicEcho (Online Complaint Registration & Civic Analytics Portal)

[![React Version](https://img.shields.io/badge/react-v19.0.0-blue.svg?style=flat-flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-v5.8.2-blue.svg?style=flat-flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/tailwindcss-v4.1.14-06B6D4.svg?style=flat-flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%20Flash%202.5-orange.svg?style=flat-flat&logo=google-gemini)](https://ai.google.dev/)
[![Express Backend](https://img.shields.io/badge/backend-express.js-lightgrey.svg?style=flat-flat&logo=express)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-flat)](https://opensource.org/licenses/MIT)

An enterprise-grade, fully localized, full-stack municipal service request portal and administrative intelligence dashboard. Built with a high-performance modern tech stack, this application empowers citizens to lodge, track, and interact with civic issues in multiple languages (with full RTL support) while offering municipal administrators actionable, real-time charts and an AI-driven triage desk.

---

## 🌟 Key Features

### 1. 🗳️ Multilingual & Auto-RTL Complaint Form (`/src/components/ComplaintForm.tsx`)
- **Native Localization:** Built-in localization support for **English**, **Arabic**, **Hindi**, and **Spanish** using a lightweight, reactive localization engine.
- **Bi-directional Layout Engine:** Dynamic layout switching between LTR (Left-to-Right) and RTL (Right-to-Left) with fluid transitions for Arabic users.
- **Smart Validation:** Robust client-side fields validating phone numbers, coordinates, and classification parameters.
- **Rich Media & Location Support:** Users can pin precise geo-coordinates and attach reference documents or photos.

### 2. 🧠 Gemini AI Civic Concierge (`/src/components/AIChatbot.tsx`)
- **Interactive Assistance:** Powered by Google's state-of-the-art **Gemini Flash 2.5 API**, server-side proxied for absolute key security.
- **Smart Triage & Support:** Guides citizens on how to draft their grievances, explains municipal jurisdictions, auto-suggests complaint categories, and answers FAQs instantly.
- **Intelligent Auto-classification:** Analyzes description text dynamically to recommend the precise government division (e.g., Waste Management, Sanitation, Civil Works).

### 3. 📊 Admin Executive Intelligence Board (`/src/components/StatsDashboard.tsx`)
- **Advanced Recharts Integration:** High-fidelity vector charts visualizing complaint categories, SLA compliance rates, and geographical density distribution.
- **SLA Heatmaps & KPI Cards:** Real-time micro-animations on cards documenting total active cases, resolved incidents, average turnaround time (TAT), and critical flags.
- **Interactive Filtering:** Filter dashboards by priority, status, date range, or region in a single click.

### 4. 📁 Real-Time Grievance Tracker (`/src/components/ComplaintDetails.tsx`)
- **Secure Audit Trails:** Complete chronological timelines showing tracking state changes (Submitted → Under Review → Assigned → In Progress → Resolved).
- **Public & Admin Commenting:** Citizens and division managers can log updates, request additional files, or update resolution statuses in a secure interface.

---

## 🛠️ Technology Stack

| Layer | Technology | Primary Purpose |
|---|---|---|
| **Frontend Core** | React 19 + TypeScript 5.8 | Highly deterministic, type-safe, and ultra-fast component system. |
| **Styling & Theme** | Tailwind CSS v4 | Cutting-edge utility framework optimizing build size and CSS nesting. |
| **Micro-Animations**| Motion | Dynamic micro-interactions, page state transitions, and modal animations. |
| **Visualizations** | Recharts + Lucide Icons | Responsive SVG-based charting and cohesive iconography system. |
| **Backend API** | Express.js + TSX | Secure server-side routes to proxy Google Gemini API calls and serve assets. |
| **Compiler / Bundler** | Vite 6 + ESBuild | Instant Hot Module Replacement (HMR) and optimized single-bundle production builds. |

---

## 📂 Architecture & Directory Layout

```bash
├── .github/                # Automation workflows (e.g., GitHub Pages or CI/CD)
├── assets/                 # Brand graphics and static imagery
├── src/
│   ├── components/
│   │   ├── AIChatbot.tsx           # AI-powered Municipal Assistant
│   │   ├── ComplaintForm.tsx       # Dynamic complaint filing desk (Multilingual / RTL)
│   │   ├── ComplaintDetails.tsx    # Live tracking and commentary timeline
│   │   └── StatsDashboard.tsx      # Admin analytical dashboard (Recharts)
│   ├── lib/
│   │   └── translations.ts         # Multi-language translation dictionaries
│   ├── App.tsx                     # Navigation, views router, and app container
│   ├── types.ts                    # Consolidated TypeScript interfaces & Enums
│   ├── main.tsx                    # React client-side hydration root
│   └── index.css                   # Global Tailwind CSS configurations & Google Fonts
├── server.ts               # Full-stack CJS Express server & Gemini API Gateway
├── tsconfig.json           # Global compiler specifications
├── vite.config.ts          # Vite build and asset pipelines
└── package.json            # Scripts, developer engines, and dependencies
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- A **Google Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Navigate
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/online-complaint-registration.git
cd online-complaint-registration
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (using `.env.example` as a template):
```bash
cp .env.example .env
```
Open `.env` and paste your Gemini API credentials securely:
```env
GEMINI_API_KEY=your_actual_google_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Boot Dev Server
```bash
npm run dev
```
Your full-stack application will boot instantly:
- Frontend Client: [http://localhost:3000](http://localhost:3000) (Proxied via Vite development middleware)
- Backend Gateway: [http://localhost:3000/api](http://localhost:3000/api)

### 5. Build for Production
Compiles the React frontend static assets and bundles the TypeScript backend into a highly optimized, cold-start resistant CommonJS executable:
```bash
npm run build
npm start
```

---

## 🤝 Contribution Guidelines
Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Developed with ❤️ for Smart Cities and Civic Tech.
</p>
