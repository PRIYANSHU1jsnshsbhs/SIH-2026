# Real-Time Crypto Fraud Attribution System
## Technical Architecture, Methodology & Implementation Plan

**SIH Problem Statement:** 26182  
**Domain:** Blockchain & Cybersecurity  
**Target User:** Law Enforcement / Cybercrime Investigators  
**Document Type:** Product & Technical Design Proposal  
**Version:** 1.0

---

## 1. Executive Summary

The proposed system is a **blockchain investigation and intelligence platform** for law-enforcement agencies.

An investigator starts with one or more cryptocurrency wallet addresses reported in a cybercrime complaint. The platform automatically retrieves relevant blockchain data, constructs a transaction/fund-flow graph, identifies known or suspected entities such as exchanges/VASPs, detects suspicious transaction patterns, assigns explainable risk scores, and generates an investigation-ready report.

The core idea is **not** to replace the blockchain or simply create another blockchain explorer.

The system creates an intelligence layer above blockchain data:

```text
Blockchain Data
      ↓
Continuous Indexing
      ↓
Searchable Blockchain Data Platform
      ↓
Investigation Graph
      ↓
Fund-Flow Analysis + Entity Attribution
      ↓
Risk / Pattern Analysis
      ↓
Investigator Dashboard + Evidence Report
```

The SIH problem statement explicitly calls for real-time blockchain intelligence, automated VASP identification, suspect-wallet tracing, cross-chain analytics, fund-flow visualization, LEA integration, standardized reports, scalable indexing, and AI/ML-assisted pattern recognition.

---

# 2. Problem Definition

## 2.1 Operational problem

Cybercrime victims may report cryptocurrency wallet addresses used to receive fraudulent funds.

The blockchain generally provides public transaction records, but raw blockchain data does not directly answer the investigator's questions:

- Where did the reported funds move?
- Which intermediary wallets were involved?
- Did funds split, merge, or move rapidly?
- Did funds cross into another blockchain?
- Did the flow reach an exchange/VASP?
- Is a discovered wallet associated with known suspicious activity?
- Which parts of a very large transaction graph deserve attention?
- What evidence supports the conclusion?
- What should the investigator investigate next?

The problem is therefore:

> **Convert large-scale, low-level blockchain transaction data into reliable, explainable and actionable investigative intelligence.**

---

# 3. Important Concept: What We Are and Are Not Solving

### We are NOT primarily solving:

> "How do we read blockchain transactions?"

Blockchain transactions can already be queried through blockchain nodes and indexing providers.

### We ARE solving:

> "How do we efficiently analyze those transactions, follow relevant fund flows, attribute addresses to known entities, identify suspicious patterns, and present defensible intelligence to investigators?"

This distinction drives the architecture.

---

# 4. Core Product Workflow

An end-to-end investigation looks like this:

```text
1. Investigator creates case
          ↓
2. Adds suspect wallet address
          ↓
3. System identifies blockchain/network
          ↓
4. Retrieve indexed transactions
          ↓
5. Construct relevant transaction subgraph
          ↓
6. Trace downstream fund movement
          ↓
7. Identify known entities / VASPs
          ↓
8. Detect cross-chain movements
          ↓
9. Calculate behavioral/risk indicators
          ↓
10. Rank important wallets and paths
          ↓
11. Generate investigation findings
          ↓
12. Investigator reviews evidence
          ↓
13. Generate standardized report
```

The investigator should never need to manually inspect thousands of raw transactions unless they deliberately want to.

---

# 5. System Architecture

```text
                         ┌──────────────────────┐
                         │      BLOCKCHAINS     │
                         │ Ethereum / Bitcoin / │
                         │ Other supported nets │
                         └──────────┬───────────┘
                                    │
                          RPC / Indexing APIs
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  DATA INGESTION      │
                         │  & INDEXER           │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ BLOCKCHAIN DATA      │
                         │ PLATFORM             │
                         │                      │
                         │ PostgreSQL /         │
                         │ ClickHouse / Object  │
                         │ Storage              │
                         └──────────┬───────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
        ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
        │ Graph / Fund   │ │ Entity / VASP  │ │ Risk / Pattern │
        │ Flow Engine    │ │ Intelligence   │ │ Engine         │
        └───────┬────────┘ └───────┬────────┘ └───────┬────────┘
                │                  │                  │
                └──────────────────┼──────────────────┘
                                   ▼
                         ┌──────────────────────┐
                         │ INVESTIGATION API   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ INVESTIGATOR         │
                         │ DASHBOARD            │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │ REPORT / EVIDENCE    │
                         └──────────────────────┘
```

---

# 6. Technology Stack

## 6.1 Backend

**Python + FastAPI**

Why:

- Excellent ecosystem for data analysis and ML
- Easy REST API development
- Good integration with blockchain libraries
- Easy integration with NetworkX, PyTorch and other analytical tools
- Async support for I/O-heavy workloads

Suggested structure:

```text
backend/
├── api/
├── services/
├── models/
├── repositories/
├── graph/
├── risk/
├── entity/
├── ingestion/
└── workers/
```

---

## 6.2 Frontend

**React + TypeScript**

Responsibilities:

- Case management
- Wallet search
- Transaction graph visualization
- Risk dashboard
- Entity information
- Investigation timeline
- Reports

For graph visualization:

- Cytoscape.js
- React Flow
- D3.js

For a complex investigation graph, Cytoscape.js is a strong candidate.

---

## 6.3 Primary database

**PostgreSQL**

Use it for:

- Cases
- Investigators
- Wallet metadata
- Transaction metadata
- Entity labels
- Risk results
- Investigation results
- Audit logs

PostgreSQL is a strong initial production choice because it is mature, reliable and supports structured relationships well.

---

## 6.4 Analytical database

For large-scale transaction analytics, consider:

**ClickHouse**

Use it for:

- Large transaction tables
- Time-range queries
- Aggregations
- Address activity analysis
- High-volume analytical workloads

A production architecture can therefore use:

```text
PostgreSQL → application/case data
ClickHouse  → large blockchain analytics
Object store → raw blockchain data
```

For the initial implementation, PostgreSQL alone can be sufficient.

---

## 6.5 Graph processing

Start with:

**NetworkX**

Use it for:

- Shortest-path analysis
- Connected components
- Degree analysis
- Graph traversal
- Centrality
- Subgraph extraction

If scale requires it later, move appropriate workloads to a graph database or distributed graph-processing system.

**Do not put the entire blockchain into a graph database just because the problem involves graphs.**

---

## 6.6 ML / GNN

Use:

**scikit-learn** for initial ML.

Use:

**PyTorch + PyTorch Geometric** if/when GNN development is justified.

The recommended order is:

```text
Rules
  ↓
Classical ML
  ↓
Graph ML / GNN
```

Do not start with a GNN.

---

# 7. Blockchain Data Acquisition

There are two main approaches.

## 7.1 Direct blockchain nodes

Run/access blockchain nodes and read:

- blocks
- transactions
- receipts
- logs
- token transfers

Advantages:

- Maximum control
- Independent data source
- Strong provenance

Disadvantages:

- Expensive infrastructure
- Operational complexity
- Large storage requirements
- Different node implementations per blockchain

---

## 7.2 Blockchain RPC / indexing providers

For an initial system, use providers such as:

- Alchemy
- Infura
- QuickNode

They expose blockchain data through APIs/RPC.

For EVM chains, typical operations include:

```text
Get latest block
Get block
Get transaction
Get transaction receipt
Get logs
Call contract
```

For token transfers, event logs are particularly important.

---

# 8. What Data We Need

For EVM chains, the core dataset includes:

### Block

```text
chain
block_number
block_hash
timestamp
```

### Transaction

```text
chain
tx_hash
block_number
timestamp
from_address
to_address
native_value
gas_used
status
```

### Token Transfer

```text
chain
tx_hash
token_contract
from_address
to_address
amount
timestamp
```

### Contract/Event Information

```text
contract_address
event_signature
topics
data
```

This lets us reconstruct meaningful asset movements rather than looking only at native cryptocurrency transfers.

---

# 9. Continuous Indexing Pipeline

A production-like ingestion architecture:

```text
Blockchain
    ↓
Provider / Node
    ↓
Ingestion Worker
    ↓
Message Queue
    ↓
Parser / Normalizer
    ↓
Validation
    ↓
Database
```

For example:

```text
Ethereum
   ↓
RPC Provider
   ↓
Ingestion Worker
   ↓
Kafka / Queue
   ↓
Transaction Parser
   ↓
ClickHouse/PostgreSQL
```

The indexer should maintain a checkpoint:

```text
chain = Ethereum
last_processed_block = 23,450,821
```

When restarted, it continues from the checkpoint.

---

# 10. Handling Blockchain Reorganizations

A serious blockchain indexer cannot assume every recently observed block is permanently final.

The ingestion system should:

1. Track block hashes.
2. Detect chain reorganizations.
3. Mark affected records.
4. Reprocess affected blocks when necessary.
5. Distinguish confirmed/finalized data from recently observed data.

This matters for evidence quality.

---

# 11. Investigation Graph

For an individual case, construct a focused graph.

### Nodes

```text
Wallet
Contract
Exchange/VASP
Bridge
Mixer
Other known entity
```

### Edges

```text
Transfer
Contract interaction
Cross-chain event
Entity relationship
```

Example:

```text
Victim Wallet
     │
     │ ₹5L
     ▼
Suspect Wallet
     │
     │ ₹4.8L
     ▼
Intermediary
     │
     ▼
Bridge
     │
     ▼
Another Chain
     │
     ▼
Exchange
```

---

# 12. Graph Traversal

Do not blindly traverse every connected address.

Use configurable constraints:

```text
max_hops
minimum_value
time_window
asset_type
chain
risk_threshold
```

Example:

```text
Start: Wallet A
Depth: 4 hops
Minimum value: ₹10,000
Time window: 30 days
```

Then rank discovered paths.

---

# 13. Path Ranking

Not every path has equal investigative importance.

Define a path score using factors such as:

```text
Path Score =
    value relevance
  + risk of destination
  + speed of movement
  + number of suspicious intermediaries
  + known entity proximity
  + cross-chain involvement
```

This allows the dashboard to show:

```text
TOP INVESTIGATIVE PATH

Wallet A
 ↓
Wallet B
 ↓
Wallet C
 ↓
Exchange X

Confidence: 91%
```

rather than displaying 20,000 irrelevant edges.

---

# 14. Fund-Flow Attribution

This is harder than ordinary graph traversal.

Suppose:

```text
Victim → Wallet A = ₹5L
```

Wallet A already contains:

```text
₹20L other funds
```

and then sends:

```text
₹10L → B
₹8L  → C
₹7L  → D
```

We cannot simply claim all outgoing funds came from the victim.

Therefore the system needs a **fund-provenance model**.

Possible models include:

- FIFO-style attribution
- proportional attribution
- temporal flow attribution
- heuristic tracing
- probabilistic attribution

The system should explicitly state the method used.

For an initial implementation, use a transparent heuristic and label results as **attributed/estimated**, not absolute truth.

---

# 15. Entity / VASP Intelligence

Create an independent entity database.

Example:

```text
ENTITY
---------------------------------
entity_id
name
type
jurisdiction
confidence
source
last_verified
```

And:

```text
ADDRESS_ENTITY
---------------------------------
chain
address
entity_id
relationship_type
confidence
source
last_verified
```

Example:

```text
0xABC...
Ethereum
Exchange X
exchange_wallet
0.96
Source Y
2026-08-20
```

---

# 16. Entity Confidence

Never represent attribution as an unquestionable fact.

Use:

```text
CONFIRMED
HIGH CONFIDENCE
LIKELY
POSSIBLE
UNKNOWN
```

Every attribution should have:

```text
source
timestamp
confidence
evidence
```

This is critical for law-enforcement use.

---

# 17. Wallet Clustering

A VASP may use many addresses.

Therefore:

```text
Address A ─┐
Address B ─┤
Address C ─┼──→ Exchange X
Address D ─┤
Address E ─┘
```

The system needs an entity-level representation.

Clustering can use:

- known labels
- common transaction behavior
- documented wallet relationships
- transaction patterns
- exchange deposit/withdrawal behavior

Again, inferred clusters must carry confidence.

---

# 18. Cross-Chain Analysis

Represent a cross-chain movement as an explicit event:

```text
CrossChainEvent

source_chain
source_address
bridge
destination_chain
destination_address
asset
amount
timestamp
confidence
```

Example:

```text
Ethereum
    ↓
Bridge X
    ↓
Polygon
    ↓
Wallet B
```

The investigation graph should continue across chains rather than ending at the bridge.

---

# 19. Risk Engine

The first production version should be **rule-based and explainable**.

Example signals:

```text
transaction velocity
unique counterparties
in/out ratio
rapid forwarding
fund concentration
fund splitting
interaction with known risky addresses
cross-chain activity
known mixer interaction
distance to known VASP
multiple victim-source relationships
```

Output:

```text
Risk Score: 82/100
Risk Level: HIGH
```

And:

```text
Reasons:
- rapid fund forwarding
- multiple suspicious counterparties
- cross-chain transfer
- high-risk destination
```

---

# 20. ML Model

ML should learn from these engineered features.

Example feature vector:

```text
[
  transaction_count,
  total_received,
  total_sent,
  unique_counterparties,
  in_degree,
  out_degree,
  median_transaction_value,
  median_holding_time,
  forwarding_ratio,
  cross_chain_count,
  risky_counterparty_ratio,
  vasp_distance,
  fund_concentration
]
```

Model options:

### Initial

Random Forest / XGBoost

Input:

```text
Wallet features
```

Output:

```text
P(suspicious)
```

Example:

```text
0.87
```

Meaning:

> Model estimates an 87% probability of the wallet matching the suspicious behavior represented in its training data.

It does **not** mean the owner is an 87% probability criminal.

---

# 21. Why Classical ML Before GNN?

Because it is:

- easier to train
- easier to explain
- easier to validate
- easier to debug
- less dependent on large graph-labelled datasets

A GNN becomes useful when we have sufficient labelled graph data.

---

# 22. GNN Approach

Later, represent the investigation as:

```text
Graph
 ├── Nodes = wallets/entities
 ├── Node features
 ├── Edges = transactions
 └── Edge features
```

A GNN can perform:

### Node classification

```text
Wallet C → suspicious probability = 0.91
```

### Edge classification

```text
A → B → suspicious-transfer probability = 0.84
```

### Graph classification

```text
Case subgraph → fraud-pattern probability = 0.89
```

For this project, **node classification is the most straightforward starting point**.

But the GNN should be an advanced layer, not the foundation.

---

# 23. Where Training Data Comes From

This is one of the hardest ML problems.

We need labelled examples:

```text
wallet → normal/suspicious
```

and ideally:

```text
transaction → normal/suspicious
```

Potential sources:

- publicly documented addresses
- appropriately licensed datasets
- confirmed investigation data
- trusted blockchain intelligence datasets

Every label should have provenance.

A model trained on poor labels will produce poor intelligence.

---

# 24. Investigation API

The frontend should communicate with a backend API.

Example:

```text
POST /cases
POST /cases/{id}/wallets
POST /investigations/{id}/trace
GET  /investigations/{id}/graph
GET  /investigations/{id}/findings
GET  /wallets/{address}
GET  /entities/{id}
POST /reports
```

Example request:

```json
{
  "chain": "ethereum",
  "address": "0xABC...",
  "max_hops": 4,
  "min_value": 10000
}
```

Example result:

```json
{
  "risk_score": 82,
  "risk_level": "HIGH",
  "vasp": {
    "name": "Exchange X",
    "confidence": 0.91
  }
}
```

---

# 25. Investigator Dashboard

The UI should answer five questions immediately:

### 1. What happened?

Fund-flow graph.

### 2. Where did the money go?

Destination/path analysis.

### 3. Who/what are these addresses associated with?

Entity attribution.

### 4. Why is this suspicious?

Explainable risk indicators.

### 5. What should I investigate next?

Ranked investigative recommendations.

---

# 26. Report Generation

A report should contain:

```text
Case information
↓
Input wallet
↓
Chains analyzed
↓
Transaction period
↓
Fund-flow summary
↓
Important addresses
↓
Entity/VASP attribution
↓
Cross-chain activity
↓
Risk indicators
↓
Evidence references
↓
Confidence levels
↓
Recommended actions
```

Every finding should be traceable back to blockchain evidence.

---

# 27. Auditability & Evidence

For law-enforcement use, every analytical conclusion needs provenance.

Store:

```text
source transaction hash
block number
timestamp
chain
data retrieval time
algorithm/version
entity-source
confidence
```

Example:

```text
Finding:
Wallet B is associated with Exchange X

Evidence:
- transaction hash: 0x...
- attribution source: ...
- attribution confidence: 0.94
- model version: entity-model-v3
- generated: 2026-09-01T...
```

This makes the platform explainable and auditable.

---

# 28. Security Architecture

Because this is sensitive law-enforcement data:

```text
Authentication
      ↓
RBAC
      ↓
Case-level authorization
      ↓
Encrypted data
      ↓
Audit logging
```

Roles may include:

```text
Investigator
Supervisor
Administrator
Auditor
```

All important actions should be logged.

---

# 29. Scaling to Lakhs of Transactions

There are two different scaling problems.

## Blockchain scale

Millions/billions of blockchain records.

Solution:

```text
Continuous indexing
+
Partitioning
+
Columnar analytics
+
Caching
+
Batch processing
```

## Investigation scale

Thousands of investigations.

Solution:

```text
Shared indexed blockchain data
            ↓
Reusable wallet/entity intelligence
            ↓
Cached analysis
            ↓
Case-specific subgraphs
```

We should **not rescan the blockchain separately for every case**.

---

# 30. Performance Strategy

Use:

### Precomputation

Calculate frequently used wallet statistics:

```text
transaction_count
total_received
total_sent
first_seen
last_seen
counterparty_count
```

### Caching

Cache frequently investigated addresses and entity lookups.

### Asynchronous jobs

Large traces should run as background jobs:

```text
POST /trace
      ↓
Job Queue
      ↓
Worker
      ↓
Result
```

The investigator can continue using the dashboard while processing happens.

---

# 31. Recommended Production Architecture

```text
                    USERS
                      │
                      ▼
             React / TypeScript
                      │
                      ▼
                 API Gateway
                      │
                      ▼
                 FastAPI
                      │
       ┌──────────────┼───────────────┐
       ▼              ▼               ▼
 Investigation     Entity          Risk/ML
   Service         Service          Service
       │              │               │
       └──────────────┼───────────────┘
                      │
              ┌───────┼────────┐
              ▼       ▼        ▼
         PostgreSQL ClickHouse Cache
              │       │
              └───────┼────────┘
                      │
                 Graph Engine
                      │
                      ▼
                 Job Queue
                      │
              ┌───────┴────────┐
              ▼                ▼
          Indexers         ML Workers
              │
              ▼
       Blockchain Providers
```

---

# 32. Initial Implementation Scope

A realistic first production-oriented prototype should support:

### Blockchain

Start with:

- Ethereum
- Polygon

Then add additional chains through an adapter architecture.

### Features

1. Wallet ingestion
2. Transaction indexing
3. Multi-hop tracing
4. Investigation graph
5. Entity/VASP database
6. Rule-based risk engine
7. Cross-chain event representation
8. Investigator dashboard
9. Report generation
10. Audit trail

### ML

Start with classical ML.

GNN comes after labelled graph data and baseline evaluation exist.

---

# 33. Chain Adapter Architecture

Do not hard-code Ethereum logic throughout the application.

Define:

```python
class BlockchainAdapter:
    get_block()
    get_transaction()
    get_transactions_for_address()
    get_token_transfers()
    parse_events()
```

Then:

```text
BlockchainAdapter
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
EVM   Bitcoin Other
```

This lets the rest of the system remain blockchain-agnostic.

---

# 34. Suggested Development Roadmap

## Phase 1 — Data

```text
Ethereum API
    ↓
Indexer
    ↓
PostgreSQL
    ↓
Wallet transaction lookup
```

## Phase 2 — Graph

```text
Wallet
 ↓
Multi-hop traversal
 ↓
Graph
 ↓
Visualization
```

## Phase 3 — Intelligence

```text
Known address database
 ↓
Entity attribution
 ↓
VASP detection
```

## Phase 4 — Risk

```text
Feature extraction
 ↓
Rules
 ↓
Risk score
```

## Phase 5 — ML

```text
Labeled data
 ↓
Feature dataset
 ↓
XGBoost/Random Forest
 ↓
Evaluation
```

## Phase 6 — Advanced Graph ML

```text
Graph dataset
 ↓
GNN
 ↓
Node/edge classification
```

## Phase 7 — Production hardening

```text
Security
Audit
Scaling
Monitoring
Evidence integrity
API integrations
```

---

# 35. What the MVP Should Demonstrate

For a complete end-to-end demonstration:

```text
Investigator
     ↓
Enter suspect wallet
     ↓
System retrieves indexed transactions
     ↓
Builds graph
     ↓
Finds intermediary wallets
     ↓
Recognizes known entity/VASP
     ↓
Calculates risk
     ↓
Shows why
     ↓
Generates report
```

The demo should use real blockchain data where practical, while clearly labelling simulated/demo intelligence where real law-enforcement datasets are unavailable.

---

# 36. Most Important Engineering Principles

### 1. Facts ≠ predictions

```text
Blockchain fact:
A sent 5 ETH to B.

Attribution:
B is associated with Exchange X.

Prediction:
B exhibits suspicious behavior.
```

Keep these separate.

### 2. Every attribution needs evidence.

### 3. Every ML output needs confidence and explanation.

### 4. Never claim that a wallet address automatically identifies a person.

### 5. Don't rescan the blockchain for every investigation.

### 6. Don't put the entire blockchain into a graph database by default.

### 7. Don't start with GNN.

### 8. Optimize for investigator usefulness, not number of technologies.

---

# 37. Final Product Definition

The proposed platform is best understood as five systems working together:

```text
                 CRYPTO FRAUD
               INTELLIGENCE PLATFORM
                       │
      ┌────────────────┼─────────────────┐
      ▼                ▼                 ▼
  BLOCKCHAIN        ENTITY             RISK
  INDEXING          INTELLIGENCE       ANALYTICS
      │                │                 │
      └────────────────┼─────────────────┘
                       ▼
                 GRAPH ENGINE
                       │
                       ▼
               INVESTIGATION ENGINE
                       │
                       ▼
             LAW-ENFORCEMENT UI
```

### In one sentence:

> **We continuously convert raw blockchain activity into a searchable intelligence layer, then use case-specific graph analysis, entity attribution, fund-flow analysis and explainable risk models to turn a suspect wallet address into an actionable investigation.**

That is the technical approach I would take if this were being designed as a real product rather than merely an SIH prototype.
