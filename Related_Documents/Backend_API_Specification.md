# Backend API Specification
## Blockchain Fraud Investigation & Attribution Platform

**Version:** 1.0  
**Backend:** FastAPI / Python  
**API Style:** REST / JSON  
**Base URL:** `/api/v1`

---

## 1. API Modules

The backend is divided into:

```text
Authentication
Cases
Wallets
Transactions
Investigations / Tracing
Graph Analysis
Entities / VASPs
Risk Analysis
Cross-Chain Analysis
Reports
System / Health
```

All normal responses use JSON.

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Request completed successfully"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "Wallet was not found"
  }
}
```

---

# 2. Authentication APIs

## POST `/auth/login`

**Description:** Authenticate an investigator and return an access token.

**Input**
```json
{
  "username": "investigator01",
  "password": "********"
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "USR-001",
      "name": "Investigator",
      "role": "investigator"
    }
  }
}
```

## GET `/auth/me`

**Description:** Return the authenticated user's information.

**Input:** None

**Output**
```json
{
  "success": true,
  "data": {
    "id": "USR-001",
    "name": "Investigator",
    "role": "investigator"
  }
}
```

---

# 3. Case Management APIs

A case represents one law-enforcement investigation.

## POST `/cases`

**Description:** Create a new investigation case.

**Input**
```json
{
  "title": "Crypto Fraud Case 2026-001",
  "description": "Suspected cryptocurrency fraud",
  "priority": "high"
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "case_id": "CASE-001",
    "title": "Crypto Fraud Case 2026-001",
    "status": "open",
    "created_at": "2026-09-03T10:00:00Z"
  }
}
```

## GET `/cases`

**Description:** List cases accessible to the investigator.

**Query parameters**
```text
status
priority
search
page
limit
```

## GET `/cases/{case_id}`

**Description:** Get complete case metadata.

**Output**
```json
{
  "success": true,
  "data": {
    "case_id": "CASE-001",
    "title": "Crypto Fraud Case 2026-001",
    "status": "open",
    "priority": "high",
    "wallets_count": 7,
    "investigations_count": 2
  }
}
```

## PATCH `/cases/{case_id}`

**Description:** Update case status, priority or other editable metadata.

**Input**
```json
{
  "status": "closed",
  "priority": "medium"
}
```

## POST `/cases/{case_id}/wallets`

**Description:** Add a wallet/address to a case.

**Input**
```json
{
  "chain": "ethereum",
  "address": "0xABC123...",
  "label": "Suspect Wallet",
  "source": "complaint"
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "case_id": "CASE-001",
    "wallet_id": "WALLET-001",
    "chain": "ethereum",
    "address": "0xABC123..."
  }
}
```

---

# 4. Wallet APIs

## GET `/wallets/{chain}/{address}`

**Description:** Return the indexed overview of a wallet.

**Output**
```json
{
  "success": true,
  "data": {
    "chain": "ethereum",
    "address": "0xABC123...",
    "first_seen": "2025-01-01T10:00:00Z",
    "last_seen": "2026-09-03T08:20:00Z",
    "transaction_count": 347,
    "total_received": "38.42",
    "total_sent": "37.91",
    "unique_counterparties": 142,
    "entity": {
      "name": "Exchange X",
      "type": "VASP",
      "confidence": 0.94
    },
    "risk": {
      "score": 82,
      "level": "high"
    }
  }
}
```

## GET `/wallets/search`

**Description:** Search indexed wallets.

**Query parameters**
```text
address
chain
entity
risk_level
page
limit
```

## GET `/wallets/{chain}/{address}/statistics`

**Description:** Return precomputed behavioral statistics used by graph/risk analysis.

**Output**
```json
{
  "transaction_count": 347,
  "incoming_count": 171,
  "outgoing_count": 176,
  "total_received": "38.42",
  "total_sent": "37.91",
  "unique_incoming_addresses": 96,
  "unique_outgoing_addresses": 83,
  "forwarding_ratio": 0.87,
  "median_holding_time_seconds": 720
}
```

---

# 5. Transaction APIs

## GET `/wallets/{chain}/{address}/transactions`

**Description:** Return transaction history for a wallet.

**Query parameters**
```text
direction=in|out|all
asset
from_date
to_date
min_value
page
limit
```

**Output**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "tx_hash": "0x123...",
        "block_number": 23450821,
        "timestamp": "2026-09-03T08:20:00Z",
        "from": "0xABC...",
        "to": "0xDEF...",
        "asset": "ETH",
        "amount": "2.5",
        "status": "confirmed"
      }
    ],
    "total": 347
  }
}
```

## GET `/transactions/{chain}/{tx_hash}`

**Description:** Return detailed transaction information.

**Output**
```json
{
  "success": true,
  "data": {
    "tx_hash": "0x123...",
    "chain": "ethereum",
    "block_number": 23450821,
    "timestamp": "2026-09-03T08:20:00Z",
    "from": "0xABC...",
    "to": "0xDEF...",
    "native_value": "2.5",
    "gas_used": 21000,
    "status": "confirmed",
    "token_transfers": []
  }
}
```

## GET `/wallets/{chain}/{address}/token-transfers`

**Description:** Return ERC-20 and other supported token transfer activity.

**Output**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "tx_hash": "0x123...",
        "token_contract": "0xToken...",
        "symbol": "USDT",
        "from": "0xABC...",
        "to": "0xDEF...",
        "amount": "50000",
        "timestamp": "2026-09-03T08:20:00Z"
      }
    ]
  }
}
```

---

# 6. Investigation / Tracing APIs

This is the main investigation layer.

## POST `/investigations`

**Description:** Start an asynchronous multi-hop investigation from a wallet.

**Input**
```json
{
  "case_id": "CASE-001",
  "chain": "ethereum",
  "start_address": "0xABC123...",
  "max_hops": 4,
  "min_value": 10000,
  "from_date": "2026-01-01",
  "to_date": "2026-09-03"
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "investigation_id": "INV-001",
    "status": "queued"
  }
}
```

Large investigations should run as background jobs rather than keeping an HTTP request open.

## GET `/investigations/{investigation_id}`

**Description:** Return investigation status and basic statistics.

**Output**
```json
{
  "success": true,
  "data": {
    "investigation_id": "INV-001",
    "status": "completed",
    "progress": 100,
    "nodes_found": 238,
    "edges_found": 421
  }
}
```

Possible statuses:

```text
queued
running
completed
failed
cancelled
```

## GET `/investigations/{investigation_id}/findings`

**Description:** Return important findings discovered during the investigation.

**Output**
```json
{
  "success": true,
  "data": {
    "findings": [
      {
        "type": "vasp_exposure",
        "severity": "high",
        "wallet": "0xDEF...",
        "description": "Funds reached an address associated with Exchange X",
        "confidence": 0.94
      },
      {
        "type": "rapid_forwarding",
        "severity": "medium",
        "wallet": "0x456...",
        "description": "Funds were forwarded shortly after receipt",
        "confidence": 0.88
      }
    ]
  }
}
```

---

# 7. Graph APIs

## GET `/investigations/{investigation_id}/graph`

**Description:** Return the investigation graph for visualization.

**Output**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "0xABC...",
        "type": "wallet",
        "label": "Suspect Wallet",
        "risk_score": 82
      }
    ],
    "edges": [
      {
        "id": "EDGE-001",
        "source": "0xABC...",
        "target": "0xDEF...",
        "asset": "ETH",
        "amount": "2.5",
        "tx_hash": "0x123..."
      }
    ]
  }
}
```

## GET `/wallets/{chain}/{address}/neighbors`

**Description:** Return directly or indirectly connected addresses.

**Query parameters**
```text
direction
hops
min_value
limit
```

## GET `/graph/path`

**Description:** Find a transaction path between two addresses.

**Query parameters**
```text
chain
source
target
max_hops
min_value
```

**Output**
```json
{
  "success": true,
  "data": {
    "path": [
      "0xAAA...",
      "0xBBB...",
      "0xCCC...",
      "0xDDD..."
    ],
    "total_hops": 3,
    "total_value": "4.7"
  }
}
```

---

# 8. Entity / VASP APIs

## GET `/entities/address/{chain}/{address}`

**Description:** Check whether an address is associated with a known entity/VASP.

**Output**
```json
{
  "success": true,
  "data": {
    "address": "0xABC...",
    "entity": {
      "entity_id": "ENT-001",
      "name": "Exchange X",
      "type": "VASP",
      "jurisdiction": "Example",
      "confidence": 0.94
    },
    "evidence": [
      {
        "source": "verified_dataset",
        "last_verified": "2026-08-20"
      }
    ]
  }
}
```

## GET `/entities/search`

**Description:** Search the entity intelligence database.

**Query parameters**
```text
name
type
jurisdiction
risk_level
page
limit
```

## GET `/entities/{entity_id}`

**Description:** Return entity information and associated addresses.

**Output**
```json
{
  "success": true,
  "data": {
    "entity_id": "ENT-001",
    "name": "Exchange X",
    "type": "VASP",
    "addresses": [
      {
        "chain": "ethereum",
        "address": "0xABC...",
        "confidence": 0.94
      }
    ]
  }
}
```

---

# 9. Risk Analysis APIs

## POST `/risk/wallet`

**Description:** Calculate the risk score of a wallet using the current rule/ML pipeline.

**Input**
```json
{
  "chain": "ethereum",
  "address": "0xABC...",
  "investigation_id": "INV-001"
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "wallet": "0xABC...",
    "risk_score": 82,
    "risk_level": "high",
    "model_version": "risk-model-v1",
    "reasons": [
      {
        "signal": "rapid_forwarding",
        "weight": 0.23
      },
      {
        "signal": "high_risk_counterparty",
        "weight": 0.31
      },
      {
        "signal": "cross_chain_activity",
        "weight": 0.18
      }
    ]
  }
}
```

Important: this is a **risk indicator**, not a declaration that the wallet owner committed a crime.

## GET `/risk/wallet/{chain}/{address}/features`

**Description:** Return the features used by the risk model.

**Output**
```json
{
  "transaction_count": 347,
  "unique_counterparties": 142,
  "forwarding_ratio": 0.87,
  "median_holding_time": 720,
  "cross_chain_count": 3,
  "risky_counterparty_ratio": 0.12
}
```

## POST `/risk/transaction`

**Description:** Calculate risk indicators for a specific transaction.

**Input**
```json
{
  "chain": "ethereum",
  "tx_hash": "0x123..."
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "tx_hash": "0x123...",
    "risk_score": 76,
    "risk_level": "high",
    "reasons": [
      "destination associated with high-risk activity"
    ]
  }
}
```

---

# 10. Cross-Chain APIs

## GET `/wallets/{chain}/{address}/cross-chain`

**Description:** Return known or inferred cross-chain movements.

**Output**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "source_chain": "ethereum",
        "source_address": "0xAAA...",
        "bridge": "Bridge X",
        "destination_chain": "polygon",
        "destination_address": "0xBBB...",
        "asset": "USDT",
        "amount": "50000",
        "timestamp": "2026-09-03T08:20:00Z",
        "confidence": 0.89
      }
    ]
  }
}
```

## POST `/cross-chain/trace`

**Description:** Trace an address across supported chains.

**Input**
```json
{
  "chain": "ethereum",
  "address": "0xABC...",
  "max_hops": 4
}
```

**Output:** Cross-chain paths, bridge events and confidence values.

---

# 11. Fund-Flow APIs

## POST `/investigations/{investigation_id}/fund-flow`

**Description:** Estimate how source funds propagated through downstream transfers.

**Input**
```json
{
  "source_transaction": "0x123...",
  "method": "proportional",
  "max_hops": 4
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "source_amount": "50000",
    "attributed_paths": [
      {
        "path": [
          "0xAAA...",
          "0xBBB...",
          "0xCCC..."
        ],
        "attributed_amount": "37500",
        "confidence": 0.81
      }
    ],
    "method": "proportional"
  }
}
```

Fund attribution is an analytical estimate. It should never be presented as absolute proof of ownership or criminal responsibility.

---

# 12. Report APIs

## POST `/reports`

**Description:** Generate an investigation report.

**Input**
```json
{
  "investigation_id": "INV-001",
  "format": "pdf",
  "include": {
    "transactions": true,
    "graph": true,
    "risk_analysis": true,
    "entity_attribution": true,
    "cross_chain": true
  }
}
```

**Output**
```json
{
  "success": true,
  "data": {
    "report_id": "REPORT-001",
    "status": "generating"
  }
}
```

## GET `/reports/{report_id}`

**Description:** Return report generation status.

**Output**
```json
{
  "success": true,
  "data": {
    "report_id": "REPORT-001",
    "status": "completed",
    "format": "pdf"
  }
}
```

## GET `/reports/{report_id}/download`

**Description:** Download the generated investigation report.

---

# 13. System APIs

## GET `/health`

**Description:** Basic application health check.

**Output**
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## GET `/system/status`

**Description:** Detailed health of important backend components.

**Output**
```json
{
  "database": "healthy",
  "blockchain_indexer": "healthy",
  "queue": "healthy",
  "ml_service": "healthy"
}
```

---

# 14. Internal Indexer APIs

These endpoints should normally not be exposed publicly.

## POST `/internal/indexer/start`

**Input**
```json
{
  "chain": "ethereum",
  "from_block": 23450000
}
```

**Description:** Start or resume blockchain indexing.

## GET `/internal/indexer/{chain}/status`

**Output**
```json
{
  "chain": "ethereum",
  "latest_block": 23450821,
  "indexed_block": 23450815,
  "lag": 6
}
```

## POST `/internal/indexer/reprocess`

**Input**
```json
{
  "chain": "ethereum",
  "from_block": 23450000,
  "to_block": 23450100
}
```

**Description:** Reprocess a block range after parser changes or blockchain reorganizations.

---

# 15. API → Service Architecture

Routes should not contain business logic directly.

Use:

```text
HTTP Request
      ↓
FastAPI Router
      ↓
Service Layer
      ↓
Repository / Data Layer
      ↓
Database
```

Example:

```text
GET /wallets/ethereum/0xABC
          ↓
wallet_router.py
          ↓
wallet_service.py
          ↓
wallet_repository.py
          ↓
PostgreSQL / ClickHouse
```

For a large investigation:

```text
POST /investigations
          ↓
Investigation Service
          ↓
Job Queue
          ↓
Investigation Worker
          ↓
Graph Engine
          ↓
Risk Engine
          ↓
Results Database
          ↓
GET /investigations/{id}/graph
```

---

# 16. Suggested Backend Structure

```text
backend/
│
├── app/
│   ├── main.py
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── cases.py
│   │       ├── wallets.py
│   │       ├── transactions.py
│   │       ├── investigations.py
│   │       ├── graph.py
│   │       ├── entities.py
│   │       ├── risk.py
│   │       ├── cross_chain.py
│   │       ├── reports.py
│   │       └── health.py
│   │
│   ├── services/
│   ├── repositories/
│   ├── blockchain/
│   ├── graph/
│   ├── risk/
│   └── workers/
│
└── tests/
```

---

# 17. Complete API Quick Reference

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate |
| GET | `/auth/me` | Current user |
| POST | `/cases` | Create case |
| GET | `/cases` | List cases |
| GET | `/cases/{id}` | Get case |
| PATCH | `/cases/{id}` | Update case |
| POST | `/cases/{id}/wallets` | Add wallet |
| GET | `/wallets/{chain}/{address}` | Wallet overview |
| GET | `/wallets/search` | Search wallets |
| GET | `/wallets/{chain}/{address}/statistics` | Wallet statistics |
| GET | `/wallets/{chain}/{address}/transactions` | Transactions |
| GET | `/transactions/{chain}/{tx_hash}` | Transaction details |
| GET | `/wallets/{chain}/{address}/token-transfers` | Token transfers |
| POST | `/investigations` | Start investigation |
| GET | `/investigations/{id}` | Investigation status |
| GET | `/investigations/{id}/findings` | Findings |
| GET | `/investigations/{id}/graph` | Investigation graph |
| GET | `/wallets/{chain}/{address}/neighbors` | Graph neighbors |
| GET | `/graph/path` | Find path |
| GET | `/entities/address/{chain}/{address}` | Address attribution |
| GET | `/entities/search` | Search entities |
| GET | `/entities/{id}` | Entity details |
| POST | `/risk/wallet` | Wallet risk |
| GET | `/risk/wallet/{chain}/{address}/features` | Risk features |
| POST | `/risk/transaction` | Transaction risk |
| GET | `/wallets/{chain}/{address}/cross-chain` | Cross-chain activity |
| POST | `/cross-chain/trace` | Cross-chain tracing |
| POST | `/investigations/{id}/fund-flow` | Fund-flow analysis |
| POST | `/reports` | Generate report |
| GET | `/reports/{id}` | Report status |
| GET | `/reports/{id}/download` | Download report |
| GET | `/health` | Health check |
| GET | `/system/status` | System status |

---

# 18. MVP API Scope

For the SIH implementation, do **not** implement every API immediately.

Start with:

```text
POST /cases
GET  /cases/{id}

POST /cases/{id}/wallets

GET  /wallets/{chain}/{address}
GET  /wallets/{chain}/{address}/transactions

POST /investigations
GET  /investigations/{id}
GET  /investigations/{id}/graph
GET  /investigations/{id}/findings

GET  /entities/address/{chain}/{address}

POST /risk/wallet

POST /reports
GET  /reports/{id}
```

This is enough to demonstrate the complete product workflow:

```text
Create Case
    ↓
Add Wallet
    ↓
View Transactions
    ↓
Start Investigation
    ↓
Build Graph
    ↓
Identify Entity/VASP
    ↓
Calculate Risk
    ↓
Show Findings
    ↓
Generate Report
```

The remaining APIs can be added as the system matures.

---

# 19. Important API Design Principles

### 1. Separate facts from analysis

Blockchain data:

```text
GET /transactions/...
```

Risk prediction:

```text
POST /risk/wallet
```

Entity attribution:

```text
GET /entities/address/...
```

These should remain separate.

### 2. Every attribution should contain evidence and confidence.

### 3. Every ML output should contain model/version information.

### 4. Risk scores should never be presented as proof of criminal activity.

### 5. Large investigations should be asynchronous.

### 6. Internal indexer endpoints should not be publicly accessible.

### 7. Use `/api/v1` versioning from the beginning.

### 8. API responses should contain stable IDs so investigations and reports can be reproduced.

---

# 20. Recommended API Technology Stack

```text
FastAPI
   ↓
Pydantic
   ↓
SQLAlchemy
   ↓
PostgreSQL
   +
ClickHouse
   ↓
Redis / Message Queue
   ↓
Blockchain RPC / Indexing Provider
   ↓
NetworkX
   ↓
scikit-learn
   ↓
PyTorch / PyTorch Geometric (later)
```

FastAPI can automatically generate OpenAPI documentation, which should be used as the living API contract for frontend and backend development.
