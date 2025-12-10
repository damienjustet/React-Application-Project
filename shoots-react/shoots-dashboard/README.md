# Shoots! — Modular Financial Dashboard

Shoots! is a modern, modular financial dashboard designed to make personal finance **clear, intuitive, and customizable**. Inspired by natural systems (like bamboo’s modular growth), Shoots! provides a flexible interface where users can visualize spending, track budgets, and manage recurring expenses — all in one elegant, drag‑and‑drop environment.

---

## 🌱 Vision

Shoots! aims to **simplify financial management** by combining:
- **Transparency** — clear breakdowns of income, spending, bills, and discretionary categories.
- **Modularity** — widgets and blocks that can be rearranged to fit each user’s workflow.
- **Elegance** — a clean, paper‑like design with dark themes, intuitive navigation, and smooth transitions.

The goal is to empower users to **see patterns in their money**, make informed decisions, and feel confident about their financial health.

---

## ✨ Core Features

- **Sidebar Navigation**
  - Home, Savings, Recurring, Spending, Budget, Settings
  - Contextual icons with right‑side helpers (e.g. plus for Home, question‑circle for Settings)

- **Spending Page**
  - Solid dashboard layout (not block‑based)
  - Monthly **Income vs Spending chart** with bills highlighted inside spending bars
  - Segment‑specific tooltips (hovering bills vs discretionary vs income shows different details)
  - Category breakdowns (pie chart + trend indicators)
  - Summary panel with income, bills, spending, frequent vendors, and largest purchases

- **Budget & Recurring Pages**
  - Track recurring expenses and upcoming bills
  - Compare budget allocations vs actual spending

- **Widgets (planned)**
  - Drag‑and‑drop modules for category spend, monthly trends, transaction filters, and alerts
  - Reusable slots for future expansion

---

## 🛠️ Technical Approach

- **Frontend**: React with componentized structure (Sidebar, Grid, Charts, Widgets)
- **Styling**: CSS with modular classes, dark theme, and responsive layout
- **Charts**: Chart.js or Recharts for stacked bar and pie visualizations
- **Data Integration**:
  - **Plaid** for bank linking
  - **Stripe** for payment processing
- **Infrastructure**:
  - AWS for hosting
  - Cloudflare + Okta for security

---

## 🚀 Goals

Shoots! is built to:
- Provide **clarity** in financial data
- Offer **customization** through modular widgets
- Deliver **insightful visualizations** that highlight trends and anomalies
- Scale into a **fintech platform** with secure integrations and user‑friendly design

---

## 📈 Roadmap

1. Finalize Spending page layout and charts
2. Integrate modular widget slots
3. Expand Budget and Recurring functionality
4. Add user customization (drag‑and‑drop, themes)
5. Connect live financial data via Plaid + Stripe

---

## 🤝 Contribution

Shoots! is in active development. Feedback, and ideas are welcome — especially around:
- UI/UX improvements
- Charting and visualization
- Modular widget design
- Secure fintech integrations

To submit feedback, email: d.anta.justet@gmail.com
---

## 📜 License

All rights reserved.  
Shoots! is proprietary software owned and developed by Damien Anta Justet.  
No part of this project may be copied, modified, or distributed without explicit written permission.
