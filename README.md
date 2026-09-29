# Blockchain Fraud Investigation & Attribution Platform

**SIH Problem Statement:** 26182
**Domain:** Blockchain & Cybersecurity

This repository contains the MVP for a real-time cryptocurrency fraud attribution and investigation platform. Designed for law enforcement agencies (LEAs), this tool streamlines the process of tracking illicit fund flows across blockchains, attributing wallets to known entities (such as VASPs/Exchanges), and identifying suspicious transaction patterns.

## 🚀 Project Overview

The core objective of this platform is to convert raw, low-level blockchain data into actionable investigative intelligence. Instead of manually tracing transactions on basic block explorers, investigators can:
1. Input a suspect wallet address.
2. Automatically generate and traverse a transaction fund-flow graph.
3. Utilize AI/ML and heuristic-based risk engines to identify suspicious activity.
4. Attribute addresses to known Virtual Asset Service Providers (VASPs).
5. Generate standardized, court-admissible reports.

## 📁 Repository Structure

- **`frontend/`**: The core frontend web application. Built with React, TypeScript, Vite, Tailwind CSS, and Cytoscape.js for graph visualization.
- **`Related_Documents/`**: Contains the full system architecture, frontend/backend specifications, and technical approach documentation.
- **`Problem_Statement/`**: Details the original hackathon problem statement and requirements.

## 💻 Tech Stack (Frontend)

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State & Data Fetching**: Zustand, TanStack Query
- **Routing**: React Router
- **Graph Visualization**: Cytoscape.js

## 🛠️ Getting Started (Local Development)

To run the frontend locally using the mocked data environment:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server with mocked data:**
   ```bash
   npm run mock
   ```
   *This starts the Vite dev server and uses local mock handlers instead of a live backend API, perfect for UI development and testing.*

4. **Build for production:**
   ```bash
   npm run build
   ```

## 📖 Documentation Reference

For an in-depth understanding of the platform's architecture and design, please review the files in the `Related_Documents/` directory:
- `Technical_Approach.md`: End-to-end architecture and methodology.
- `Frontend_Specification.md`: Detailed breakdown of all UI views and UX rules.
- `Backend_API_Specification.md`: REST API specifications for the intelligence engine.
- `TGN_Architecture.md`: Graph network intelligence models.

---
*Built for the Smart India Hackathon 2026*
