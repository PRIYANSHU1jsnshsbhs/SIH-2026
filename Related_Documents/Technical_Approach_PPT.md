# SIH Technical Approach — Unified System Architecture

## Blockchain Fraud Investigation & Attribution Platform

> **Purpose of this document:** This is the **slide-ready technical architecture** for the SIH presentation.  
> It combines the complete system into one workflow: **Frontend → Backend → Blockchain Data Ingestion → Data/Graph Layer → Investigation Engine → AI/ML/GNN → Entity/VASP Intelligence → Reports**.

---

# 1. What the Technical Approach Slide Should Communicate

The slide should answer one question immediately:

> **How does our system take a suspect wallet/address and turn raw blockchain transactions into an explainable investigation with graph-based tracing, risk analysis, entity attribution and an evidence-backed report?**

The architecture should therefore be shown as a **left-to-right investigation pipeline**, rather than as disconnected technologies.

```text
INVESTIGATOR
     ↓
WEB APPLICATION
     ↓
BACKEND / API
     ↓
BLOCKCHAIN DATA INGESTION
     ↓
TRANSACTION + GRAPH DATA
     ↓
INVESTIGATION ENGINE
     ↓
AI / ML / GNN + ENTITY INTELLIGENCE
     ↓
FINDINGS
     ↓
REPORT / DASHBOARD
```

---

# 2. Recommended Slide Layout

Use a layout similar to the previous winning SIH slide:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECHNICAL APPROACH                                  │
│                                                                             │
├────────────────────┬────────────────────┬────────────────────┬──────────────┤
│  1. USER / FRONTEND │ 2. DATA INGESTION  │ 3. INVESTIGATION   │ 4. AI +      │
│                     │                    │    & GRAPH ENGINE  │    OUTPUT    │
│                     │                    │                    │              │
│ Investigator UI     │ Blockchain RPC     │ Graph construction │ ML / GNN     │
│ Cases               │ Indexers           │ Multi-hop tracing  │ Risk score   │
│ Wallets             │ Event parser       │ Path finding       │ Anomaly      │
│ Graph               │ Normalization      │ Fund flow          │ Entity/VASP  │
│ Reports             │                    │ Cross-chain        │ Findings     │
│                     │                    │                    │ Report       │
├─────────────────────┴────────────────────┴────────────────────┴──────────────┤
│                         TECHNOLOGY STACK                                     │
│ React | TypeScript | FastAPI | Python | PostgreSQL | ClickHouse | Neo4j     │
│ Redis/Queue | Blockchain RPC | NetworkX | scikit-learn | PyTorch Geometric  │
└─────────────────────────────────────────────────────────────────────────────┘
```

The exact visual implementation can use **4 major dashed panels**, arrows between them, and a thin technology strip at the bottom.

---

# 3. COMPLETE END-TO-END WORKFLOW

This is the central workflow that should drive the arrows on the slide.

```text
┌──────────────────────┐
│  INVESTIGATOR        │
│  Login / Case        │
│  Suspect Wallet      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  FRONTEND            │
│  React + TypeScript  │
│                      │
│  Case Management     │
│  Wallet Explorer     │
│  Transaction View    │
│  Graph Visualization │
│  Risk / Findings     │
│  Reports             │
└──────────┬───────────┘
           │ REST/JSON
           ▼
┌──────────────────────┐
│  BACKEND API         │
│  FastAPI + Python    │
│                      │
│  Auth                │
│  Case Service        │
│  Investigation API   │
│  Wallet/Tx API       │
│  Risk API            │
│  Report API          │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────────┐
│ BLOCKCHAIN DATA INGESTION       │
│                                 │
│ RPC / Indexing Providers        │
│        ↓                        │
│ Block & Transaction Fetcher     │
│        ↓                        │
│ Event / Token Transfer Parser   │
│        ↓                        │
│ Data Normalization              │
│        ↓                        │
│ Persistent Transaction Storage  │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│ DATA + GRAPH LAYER               │
│                                 │
│ PostgreSQL → metadata/cases     │
│ ClickHouse → large tx history   │
│ Neo4j → address/transaction     │
│          relationship graph     │
└──────────────┬──────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ INVESTIGATION ENGINE                   │
│                                        │
│ Seed Wallet                            │
│    ↓                                   │
│ Multi-hop Traversal                    │
│    ↓                                   │
│ Path / Fund-flow Analysis              │
│    ↓                                   │
│ Temporal & Behavioral Features         │
│    ↓                                   │
│ Cross-chain / Bridge Detection         │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ AI / ML / GNN + ENTITY INTELLIGENCE    │
│                                        │
│ Rule-based signals                     │
│        +                               │
│ ML anomaly / risk model                │
│        +                               │
│ Graph features / GNN                  │
│        +                               │
│ VASP / Entity address intelligence     │
│        ↓                               │
│ Explainable Risk Score + Findings      │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ INVESTIGATION OUTPUT                   │
│                                        │
│ Risk-ranked wallets                    │
│ Suspicious transaction paths           │
│ VASP / entity exposure                 │
│ Cross-chain links                      │
│ Evidence + confidence                 │
│ Interactive graph                     │
│ Investigation report                  │
└────────────────────────────────────────┘
```

---

# 4. PANEL 1 — INVESTIGATOR + FRONTEND

## Title on slide

**INVESTIGATOR INTERFACE**

## Purpose

The investigator provides the starting point and interacts with the analysis results.

## Components

```text
Login
  ↓
Case Management
  ↓
Wallet / Transaction Search
  ↓
Start Investigation
  ↓
Interactive Graph
  ↓
Risk & Findings
  ↓
Report Generation
```

## Frontend technology

```text
React
TypeScript
Tailwind CSS
TanStack Query
React Flow / Cytoscape.js
```

## Main UI pages

```text
Dashboard
Cases
Case Detail
Wallet Explorer
Transaction Explorer
Investigation Graph
Findings
Risk Analysis
Entity / VASP Explorer
Cross-chain Analysis
Reports
```

## Slide visual

Use an investigator icon → laptop/dashboard → graph visualization.

---

# 5. PANEL 2 — BLOCKCHAIN DATA INGESTION

## Title on slide

**BLOCKCHAIN DATA INGESTION**

This is one of the most important parts of the system.

The system does **not** query the blockchain from scratch every time an investigator clicks a button.

Instead:

```text
Blockchain
    ↓
Continuous Indexer
    ↓
Normalized Transaction Dataset
    ↓
Database / Graph Store
    ↓
Investigation Queries
```

## Workflow

```text
Blockchain RPC / Indexing Provider
            ↓
       Block Fetcher
            ↓
   Transaction Decoder
            ↓
 Token Transfer / Event Parser
            ↓
       Normalization
            ↓
    Deduplication / Validation
            ↓
       Data Storage
```

## What is collected

```text
Block number
Timestamp
Transaction hash
Sender
Receiver
Native asset value
Token transfers
Contract/event data
Gas information
Chain
```

## Technology

```text
Blockchain RPC
Indexing APIs
Python
Async workers
Redis / Queue
```

## Important architecture decision

Use a **continuous ingestion pipeline** for supported chains.

For a prototype, this can start with an indexing provider/API.

For production, the architecture should support running dedicated indexers or blockchain nodes where appropriate.

---

# 6. PANEL 3 — DATA + GRAPH LAYER

## Title on slide

**TRANSACTION & GRAPH INTELLIGENCE**

Raw blockchain transactions are converted into a graph.

## Graph model

```text
Wallet / Contract = NODE

Transaction / Transfer = EDGE
```

Example:

```text
Wallet A
   │
   │ 10 ETH
   │ Tx: 0x123...
   ▼
Wallet B
   │
   │ 9.8 ETH
   │
   ▼
Wallet C
   │
   ▼
Exchange / VASP
```

## Storage responsibilities

### PostgreSQL

Used for:

```text
Users
Cases
Investigations
Reports
Entity metadata
Application state
```

### ClickHouse

Used for:

```text
Large-scale transaction history
Time-series transaction queries
Aggregation
Analytics
```

### Neo4j

Used for:

```text
Wallet relationships
Transaction relationships
Multi-hop traversal
Path queries
Graph analysis
```

## Important distinction

Do **not** store everything only in Neo4j.

The architecture should use:

```text
PostgreSQL
     +
ClickHouse
     +
Neo4j
```

because each database has a different job.

---

# 7. PANEL 4 — INVESTIGATION / GRAPH ENGINE

## Title on slide

**MULTI-HOP INVESTIGATION ENGINE**

This is the core of the product.

When an investigator submits:

```text
Seed wallet = 0xABC...
Max hops = 4
Date range = ...
Minimum value = ...
```

the system performs:

```text
Seed Wallet
    ↓
Direct Transactions
    ↓
1-Hop Counterparties
    ↓
2-Hop Counterparties
    ↓
3-Hop Counterparties
    ↓
4-Hop Counterparties
```

Then it ranks the resulting paths.

## Main analysis modules

### A. Multi-hop tracing

Find connected addresses up to a configurable depth.

### B. Path finding

Find important paths between source and destination wallets.

### C. Fund-flow analysis

Estimate how source funds propagated through downstream transfers.

### D. Temporal analysis

Analyze:

```text
transaction frequency
holding time
time between receipt and forwarding
burst activity
```

### E. Behavioral analysis

Analyze:

```text
number of counterparties
in/out ratio
forwarding ratio
transaction patterns
interaction with risky addresses
```

### F. Cross-chain analysis

Detect likely movement through:

```text
bridges
cross-chain services
chain transitions
```

---

# 8. PANEL 5 — AI / ML / GNN

## Title on slide

**AI-POWERED RISK & GRAPH ANALYTICS**

Do not present AI as a black box that magically identifies criminals.

The system should combine:

```text
Blockchain Facts
       +
Graph Features
       +
Behavioral Features
       +
Known Entity Intelligence
       ↓
Risk / Anomaly Analysis
```

---

## 8.1 Rule-Based Detection

Rules provide transparent signals.

Examples:

```text
Rapid forwarding
High transaction velocity
Large number of new counterparties
Interaction with known high-risk entities
Unusual transaction bursts
Cross-chain movement
```

Output:

```text
Risk signals
```

---

## 8.2 ML Risk Model

The ML model receives engineered wallet/transaction features.

Example features:

```text
transaction_count
unique_counterparties
incoming_volume
outgoing_volume
forwarding_ratio
median_holding_time
transaction_frequency
cross_chain_count
risky_counterparty_ratio
```

Output:

```text
Risk Score
Risk Level
Contributing Signals
```

Example:

```text
Risk Score: 82 / 100
Risk Level: HIGH

Signals:
Rapid forwarding       +23%
Risky counterparties    +31%
Cross-chain activity    +18%
Short holding time      +11%
```

The exact model can initially be:

```text
Logistic Regression
Random Forest
XGBoost
Isolation Forest
```

depending on the available labelled/unlabelled data.

---

# 9. GNN — WHERE IT ACTUALLY FITS

## Title

**GRAPH NEURAL NETWORK / GRAPH LEARNING**

GNN should operate on the transaction graph rather than raw transaction rows.

Conceptually:

```text
Transaction Graph
       ↓
Node Features
       +
Edge Features
       ↓
Graph Neural Network
       ↓
Node / Edge Embeddings
       ↓
Risk / Anomaly Classification
```

## Node features

```text
transaction count
incoming volume
outgoing volume
unique counterparties
average holding time
risk exposure
cross-chain activity
```

## Edge features

```text
amount
asset
timestamp
transaction frequency
transaction direction
```

## Possible output

```text
wallet embedding
node risk score
anomaly probability
suspicious edge probability
```

---

# 10. IMPORTANT — GNN SHOULD NOT BE OVERSOLD

For the actual product:

```text
MVP
  ↓
Graph algorithms
  +
Rule engine
  +
Classical ML
```

Then:

```text
Phase 2
  ↓
GNN / Graph ML
```

A GNN needs meaningful training/validation data.

Simply putting "GNN" on the architecture diagram without a credible dataset and evaluation methodology is technically weak.

For the SIH presentation, show:

```text
Graph Analytics
        +
ML Risk Engine
        +
GNN / Graph Learning (Advanced)
```

This communicates the intended architecture without pretending that a GNN alone solves attribution.

---

# 11. ENTITY / VASP INTELLIGENCE

## Title on slide

**ENTITY & VASP ATTRIBUTION**

The blockchain gives us:

```text
Address
```

It does not automatically give us:

```text
Real-world identity
```

Therefore, the system maintains an intelligence layer containing known address/entity associations.

## Workflow

```text
Wallet Address
      ↓
Entity Intelligence Database
      ↓
Known Address Match?
      ↓
YES ──────────────── NO
 ↓                    ↓
Entity/VASP          Unknown
 ↓
Confidence + Source
```

## Output

```text
Entity: Exchange X
Type: VASP
Confidence: 94%
Source: Verified Dataset
Last Verified: ...
```

## Important

Entity attribution should always expose:

```text
Source
Confidence
Last verified date
```

because address labels can be incomplete or outdated.

---

# 12. CROSS-CHAIN ANALYSIS

## Title on slide

**CROSS-CHAIN TRACE**

For supported bridges/services:

```text
Ethereum
    ↓
Bridge Event
    ↓
Polygon
    ↓
Wallet
    ↓
VASP
```

The system attempts to correlate:

```text
source chain
bridge/service
destination chain
destination address
asset
amount
timestamp
```

and assigns a confidence value.

## UI output

```text
Ethereum
    │
    │ Bridge
    ▼
Polygon
    │
    ▼
Wallet
    │
    ▼
VASP
```

---

# 13. REPORT / EVIDENCE LAYER

## Title

**EVIDENCE-BACKED INVESTIGATION REPORT**

The final output should not simply say:

> "This wallet is fraudulent."

Instead it should provide:

```text
Observed Transactions
        +
Graph Relationships
        +
Risk Signals
        +
Entity Attribution
        +
Cross-chain Evidence
        ↓
Investigation Findings
        ↓
Evidence-backed Report
```

## Report contents

```text
Case information
Seed wallet
Transaction timeline
Fund-flow paths
Interactive/static graph
Risk analysis
Entity/VASP exposure
Cross-chain activity
Evidence sources
Confidence values
Model version
Timestamp
```

---

# 14. COMPLETE ARCHITECTURE — ONE DIAGRAM

This is the **main diagram to convert into the PPT slide**.

```text
╔══════════════════════════════════════════════════════════════════════════════════╗
║                         BLOCKCHAIN FRAUD INVESTIGATION PLATFORM                  ║
╠═══════════════╦══════════════════╦══════════════════════╦════════════════════════╣
║ INVESTIGATOR  ║ BLOCKCHAIN DATA  ║ DATA + GRAPH        ║ AI / INVESTIGATION     ║
║ INTERFACE     ║ INGESTION        ║ INTELLIGENCE        ║ ENGINE                 ║
║               ║                  ║                      ║                        ║
║ React         ║ Blockchain       ║ PostgreSQL           ║ Multi-hop Tracing      ║
║ TypeScript    ║ RPC / Indexer    ║ Case Metadata        ║ Path Finding           ║
║               ║       ↓          ║                      ║ Fund Flow              ║
║ Dashboard     ║ Block Fetcher    ║ ClickHouse           ║ Temporal Analysis      ║
║ Cases         ║       ↓          ║ Transaction Data     ║ Behavioral Features    ║
║ Wallets       ║ Decoder          ║                      ║ Cross-chain Analysis   ║
║ Transactions  ║       ↓          ║ Neo4j                ║                        ║
║ Graph         ║ Event Parser     ║ Wallet/Tx Graph      ║ Rule Engine            ║
║ Risk          ║       ↓          ║                      ║       +                ║
║ Reports       ║ Normalize        ║ Graph Queries        ║ Classical ML           ║
║               ║       ↓          ║                      ║       +                ║
║               ║ Store            ║                      ║ GNN / Graph Learning   ║
║               ║                  ║                      ║       ↓                ║
╠═══════════════╩══════════════════╩══════════════════════╩════════════════════════╣
║                            ENTITY INTELLIGENCE                                  ║
║              VASP / Exchange Labels • Address Attribution • Confidence         ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                             INVESTIGATION OUTPUT                                ║
║ Risk-ranked wallets • Transaction paths • Entity exposure • Cross-chain links  ║
║                   Findings • Interactive Graph • Evidence Report                ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

# 15. BETTER VISUAL WORKFLOW FOR THE ACTUAL PPT

Instead of putting every component in one giant architecture box, use **three horizontal stages** with a technology layer.

```text
                         TECHNICAL APPROACH

┌──────────────────────┐
│  01 — INGEST         │
│                      │
│ Blockchain           │
│    ↓                 │
│ RPC / Indexers       │
│    ↓                 │
│ Parser + Normalizer  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  02 — BUILD          │
│                      │
│ Transaction Store    │
│    +                 │
│ Graph Database       │
│    ↓                 │
│ Wallet Graph         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  03 — INVESTIGATE    │
│                      │
│ Multi-hop Trace      │
│ Fund Flow            │
│ Cross-chain          │
│ Behavioral Features  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  04 — INTELLIGENCE   │
│                      │
│ Rules + ML + GNN     │
│ Entity / VASP        │
│ Risk Scoring         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  05 — OUTPUT         │
│                      │
│ Graph                │
│ Findings             │
│ Evidence             │
│ Investigation Report │
└──────────────────────┘
```

Place the **Frontend + Backend** underneath these stages:

```text
React / TypeScript
        ↓
FastAPI / Python
        ↓
Investigation Services
```

This makes the system easier to understand than showing 40 arrows everywhere.

---

# 16. FRONTEND ↔ BACKEND ↔ AI DATA FLOW

A particularly useful small diagram for the PPT:

```text
                 INVESTIGATOR
                      │
                      ▼
             ┌─────────────────┐
             │ React Frontend  │
             └────────┬────────┘
                      │ REST API
                      ▼
             ┌─────────────────┐
             │ FastAPI Backend │
             └────────┬────────┘
                      │
          ┌───────────┼────────────┐
          ▼           ▼            ▼
      Case API    Wallet API    Risk API
          │           │            │
          └───────────┼────────────┘
                      ▼
             ┌─────────────────┐
             │ Investigation   │
             │ Engine          │
             └────────┬────────┘
                      │
        ┌─────────────┼──────────────┐
        ▼             ▼              ▼
    Graph DB       ML Engine     Entity DB
        │             │              │
        └─────────────┼──────────────┘
                      ▼
               Findings / Report
```

---

# 17. BACKEND ASYNCHRONOUS INVESTIGATION FLOW

Large investigations should not block the HTTP request.

```text
POST /investigations
        ↓
Create Investigation ID
        ↓
Queue Background Job
        ↓
Worker
        ↓
Fetch / Query Transactions
        ↓
Build / Query Graph
        ↓
Calculate Features
        ↓
Run Risk / Graph Models
        ↓
Generate Findings
        ↓
Store Results
        ↓
Status = COMPLETED
```

Frontend:

```text
GET /investigations/{id}
```

can poll the status or later use WebSockets/SSE for live progress.

---

# 18. TECHNOLOGY STACK STRIP FOR PPT

Use icons/logos rather than writing long descriptions.

## Frontend

```text
React
TypeScript
Tailwind CSS
TanStack Query
React Flow / Cytoscape.js
```

## Backend

```text
FastAPI
Python
Pydantic
SQLAlchemy
Redis / Queue
```

## Data

```text
PostgreSQL
ClickHouse
Neo4j
```

## Blockchain

```text
Blockchain RPC
Indexing APIs
Event / Log Decoders
```

## AI / ML

```text
scikit-learn
XGBoost / equivalent
PyTorch
PyTorch Geometric
NetworkX
```

## Deployment

```text
Docker
Nginx
Cloud / VM
```

---

# 19. COLOR / VISUAL LANGUAGE FOR THE SLIDE

A similar visual language to the previous winning PPT can work well:

```text
BLUE   → Data / system flow
GREEN  → Verified / known entity
RED    → High-risk / suspicious signal
ORANGE → Processing / warning
BLACK  → Architecture / labels
GRAY   → Supporting information
```

Use color sparingly.

Every color should have a semantic meaning.

---

# 20. ICONS TO USE

Recommended visual icons:

```text
Investigator        → 👤
Web Application     → 💻
Blockchain          → ⛓
Database            → 🗄
Graph               → network icon
AI/ML               → brain / chip
GNN                 → connected-node icon
VASP                → building / exchange icon
Risk                → shield / warning icon
Report              → document icon
```

Prefer professional vector icons/logos in the actual PPT instead of emoji.

---

# 21. THE CORE STORY OF THE SLIDE

The judges should be able to follow this without reading every box:

```text
                    RAW BLOCKCHAIN DATA
                           │
                           ▼
                  ┌─────────────────┐
                  │ DATA INGESTION   │
                  │ Parse + Normalize│
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ TRANSACTION     │
                  │ + GRAPH STORE   │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ INVESTIGATION   │
                  │ MULTI-HOP TRACE │
                  └────────┬────────┘
                           │
                           ▼
              ┌──────────────────────────┐
              │ AI + ML + GRAPH LEARNING │
              │ Risk + Anomaly Detection │
              └────────────┬─────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ ENTITY / VASP   │
                  │ ATTRIBUTION     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ EVIDENCE-BACKED │
                  │ FINDINGS        │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ INVESTIGATOR UI │
                  │ + REPORT        │
                  └─────────────────┘
```

---

# 22. ONE-LINE TECHNICAL VALUE PROPOSITION

Put a short sentence near the bottom of the slide:

> **“We transform raw, fragmented blockchain transactions into a persistent transaction graph and combine multi-hop tracing, graph analytics, AI/ML risk analysis and entity intelligence to produce explainable, evidence-backed investigation leads.”**

---

# 23. WHAT NOT TO PUT ON THE SLIDE

Avoid making the same mistake many hackathon architecture slides make: listing technologies without showing their role.

Do **not** simply write:

```text
React
Node
Python
TensorFlow
Neo4j
Blockchain
AI
ML
GNN
Docker
AWS
```

with arrows between them.

Instead show:

```text
Technology
    ↓
System Component
    ↓
Actual Function
```

Example:

```text
Neo4j
  ↓
Transaction Graph
  ↓
Multi-hop path discovery
```

and:

```text
PyTorch Geometric
  ↓
Graph Learning
  ↓
Node / edge risk representation
```

---

# 24. FINAL PPT-READY STRUCTURE

If only **one technical approach slide** is available, use this exact hierarchy:

```text
                         TECHNICAL APPROACH

┌────────────────────┐   ┌────────────────────┐
│ 1. DATA INGESTION  │ → │ 2. GRAPH CREATION  │
│                    │   │                    │
│ Blockchain         │   │ Transaction Store  │
│ RPC / Indexer      │   │ Graph Database     │
│ Parser             │   │ Wallet Nodes       │
│ Normalizer         │   │ Transaction Edges │
└────────────────────┘   └─────────┬──────────┘
                                    │
                                    ▼
┌────────────────────┐   ┌────────────────────┐
│ 4. AI INTELLIGENCE │ ← │ 3. INVESTIGATION   │
│                    │   │                    │
│ Rules              │   │ Multi-hop Trace    │
│ ML Risk Model      │   │ Path Finding       │
│ Anomaly Detection  │   │ Fund Flow          │
│ GNN / Graph ML     │   │ Cross-chain        │
└─────────┬──────────┘   └────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────┐
│ 5. ENTITY + VASP INTELLIGENCE                   │
│ Address Attribution • Confidence • Evidence    │
└───────────────────────┬─────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────┐
│ 6. INVESTIGATOR OUTPUT                          │
│ Interactive Graph • Risk • Findings • Report    │
└─────────────────────────────────────────────────┘

───────────────────────────────────────────────────
FRONTEND: React + TypeScript + React Flow
BACKEND: FastAPI + Python
DATA: PostgreSQL + ClickHouse + Neo4j
AI/ML: scikit-learn + PyTorch + PyTorch Geometric
BLOCKCHAIN: RPC + Indexing APIs
INFRA: Docker + Redis/Queue
───────────────────────────────────────────────────
```

---

# 25. Final Architecture Principle

The system should be understood as **one pipeline**, not five separate technologies:

```text
BLOCKCHAIN
    ↓
DATA
    ↓
GRAPH
    ↓
INVESTIGATION
    ↓
AI / ML / GNN
    ↓
ENTITY INTELLIGENCE
    ↓
EVIDENCE
    ↓
INVESTIGATOR
```

The frontend is the **investigator's control and visualization layer**.

The backend is the **orchestration layer**.

The blockchain indexer is the **data acquisition layer**.

The databases are the **persistence and query layer**.

The graph engine is the **relationship/tracing layer**.

ML/GNN is the **risk and pattern-analysis layer**.

Entity/VASP intelligence is the **attribution layer**.

The report system is the **evidence/output layer**.

That separation is what makes the architecture scalable beyond an SIH prototype.
