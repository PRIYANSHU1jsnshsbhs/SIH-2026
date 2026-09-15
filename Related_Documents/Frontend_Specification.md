# Frontend Application Specification
## Blockchain Fraud Investigation & Attribution Platform

**Version:** 1.0  
**Frontend:** React + TypeScript  
**UI:** Tailwind CSS + component library  
**Visualization:** React Flow / Cytoscape.js  
**State:** TanStack Query + lightweight local UI state  
**API Base:** `/api/v1`

---

# 1. Frontend Product Structure

The application is an investigator-focused web application.

The primary workflow is:

```text
Login
  ↓
Dashboard
  ↓
Create / Open Case
  ↓
Add Suspect Wallet
  ↓
Wallet Overview
  ↓
Start Investigation
  ↓
Investigation Graph
  ↓
Trace Funds / Inspect Transactions
  ↓
Entity / VASP Identification
  ↓
Risk Analysis
  ↓
Investigation Findings
  ↓
Generate Report
```

The UI should prioritize **investigation workflow and evidence**, not decorative dashboards.

---

# 2. Global Application Layout

After login, every main page uses a common shell.

```text
┌─────────────────────────────────────────────────────────────┐
│ Logo / Product Name                    Search   User Profile │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ Dashboard    │                                              │
│ Cases        │               PAGE CONTENT                   │
│ Investigate  │                                              │
│ Entities     │                                              │
│ Reports      │                                              │
│              │                                              │
│ Settings     │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## Global components

- `AppShell`
- `Sidebar`
- `TopBar`
- `GlobalSearch`
- `Breadcrumbs`
- `NotificationCenter`
- `UserMenu`
- `PageHeader`
- `LoadingState`
- `ErrorState`
- `EmptyState`
- `ConfirmDialog`
- `Toast`
- `Modal`

## UX rules

- Keep navigation persistent.
- Never hide the current investigation context.
- Show loading/progress for expensive blockchain operations.
- Use clear labels instead of blockchain jargon where possible.
- Use consistent risk levels throughout the application.
- Never represent a model prediction as confirmed criminal activity.

---

# 3. Page 1 — Login

## Route

```text
/login
```

## Purpose

Authenticate an investigator before allowing access to sensitive investigation data.

## Components

```text
LoginPage
├── Logo
├── Username Input
├── Password Input
├── Login Button
└── Error Message
```

## API Calls

### On submit

```http
POST /api/v1/auth/login
```

### After successful login

```http
GET /api/v1/auth/me
```

## UX

- Minimal screen.
- No unnecessary graphics.
- Clear authentication error.
- Disable button while request is running.
- Redirect to Dashboard after successful login.

---

# 4. Page 2 — Dashboard

## Route

```text
/dashboard
```

## Purpose

Give investigators a quick overview of their active workload.

## Layout

```text
┌─────────────────────────────────────────────────────┐
│ Dashboard                                           │
├──────────┬──────────┬──────────┬────────────────────┤
│ Open     │ Active   │ High Risk│ Investigations    │
│ Cases    │ Traces   │ Wallets  │ Today             │
├──────────┴──────────┴──────────┴────────────────────┤
│                                                     │
│ Recent Cases                                        │
│                                                     │
├─────────────────────────┬───────────────────────────┤
│ Recent Investigations   │ High Risk Findings        │
│                         │                           │
└─────────────────────────┴───────────────────────────┘
```

## Components

- `StatCard`
- `RecentCasesTable`
- `RecentInvestigationsTable`
- `HighRiskFindings`
- `QuickActionCard`
- `ActivityFeed`

## API Calls

```http
GET /api/v1/cases
```

Potentially:

```http
GET /api/v1/system/status
```

## Quick actions

```text
+ New Case
Investigate Wallet
Search Entity
Generate Report
```

## UX

Do not overload the dashboard with charts.

The investigator's main question should be:

> "What needs my attention?"

Prioritize:

1. High-risk findings
2. Active investigations
3. Recently updated cases
4. Investigation failures/warnings

---

# 5. Page 3 — Cases List

## Route

```text
/cases
```

## Purpose

View, search and manage investigations.

## Components

- `CaseTable`
- `SearchBar`
- `FilterPanel`
- `StatusFilter`
- `PriorityFilter`
- `Pagination`
- `CreateCaseButton`

## API

```http
GET /api/v1/cases
```

Query parameters:

```text
status
priority
search
page
limit
```

## UX

Use a dense table because investigators need to scan many cases.

Suggested columns:

```text
Case ID
Title
Priority
Status
Wallets
Last Activity
Created
Actions
```

Use visual badges:

```text
HIGH
MEDIUM
LOW

OPEN
IN PROGRESS
CLOSED
```

---

# 6. Page 4 — Create Case

## Route

```text
/cases/new
```

## Purpose

Create a new investigation.

## Components

- `CaseForm`
- Title input
- Description textarea
- Priority selector
- Optional initial wallet
- `CreateCaseButton`

## API

```http
POST /api/v1/cases
```

If an initial wallet is provided:

```http
POST /api/v1/cases/{case_id}/wallets
```

## UX

Keep the form short.

Do not ask investigators for information that can be discovered later.

After creation:

```text
Create Case
    ↓
Case Detail
```

---

# 7. Page 5 — Case Detail

## Route

```text
/cases/{case_id}
```

## Purpose

Central workspace for one investigation case.

## Layout

```text
┌─────────────────────────────────────────────────────┐
│ Case ID / Title                     Status / Priority│
├─────────────────────────────────────────────────────┤
│ Case Summary                                        │
├─────────────────────────────────────────────────────┤
│ Wallets                                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Investigations                                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Findings / Activity                                 │
└─────────────────────────────────────────────────────┘
```

## Components

- `CaseHeader`
- `CaseSummary`
- `WalletList`
- `InvestigationList`
- `FindingList`
- `ActivityTimeline`
- `AddWalletModal`
- `StartInvestigationButton`

## APIs

```http
GET /api/v1/cases/{case_id}
```

```http
POST /api/v1/cases/{case_id}/wallets
```

Investigation data:

```http
POST /api/v1/investigations
```

## UX

This page should feel like a **case file**, not a generic admin page.

---

# 8. Page 6 — Wallet Overview

## Route

```text
/wallets/{chain}/{address}
```

## Purpose

Provide a detailed overview of a blockchain address.

## Layout

```text
┌─────────────────────────────────────────────────────┐
│ Wallet Address                    Copy / Add to Case │
│ Ethereum                                            │
├──────────────┬──────────────┬───────────────────────┤
│ Risk Score   │ Tx Count     │ Total Received        │
├──────────────┴──────────────┴───────────────────────┤
│ Entity / VASP Information                            │
├───────────────────────────────┬─────────────────────┤
│ Balance / Activity Summary    │ Risk Signals        │
├───────────────────────────────┴─────────────────────┤
│ Recent Transactions                                 │
└─────────────────────────────────────────────────────┘
```

## Components

- `WalletHeader`
- `AddressCopyButton`
- `RiskBadge`
- `WalletStats`
- `EntityCard`
- `RiskSignals`
- `TransactionTable`
- `AddToCaseButton`

## APIs

```http
GET /api/v1/wallets/{chain}/{address}
```

```http
GET /api/v1/wallets/{chain}/{address}/statistics
```

```http
GET /api/v1/wallets/{chain}/{address}/transactions
```

```http
GET /api/v1/entities/address/{chain}/{address}
```

## UX

Address strings are difficult to read.

Display:

```text
0xA81F...92BC
```

but always allow one-click copying and provide the full address on hover/details.

---

# 9. Page 7 — Transaction Explorer

## Route

```text
/wallets/{chain}/{address}/transactions
```

## Purpose

Inspect detailed transaction history.

## Components

- `TransactionTable`
- `TransactionFilters`
- `DateRangePicker`
- `AssetFilter`
- `DirectionFilter`
- `ValueFilter`
- `Pagination`
- `TransactionDetailDrawer`

## API

```http
GET /api/v1/wallets/{chain}/{address}/transactions
```

When a transaction is selected:

```http
GET /api/v1/transactions/{chain}/{tx_hash}
```

## UX

Use a table optimized for scanning.

Columns:

```text
Time
Direction
From
To
Asset
Amount
Transaction Hash
Risk
```

Clicking a transaction should open a side drawer instead of navigating away.

---

# 10. Page 8 — Start Investigation

## Route

```text
/investigations/new
```

or opened from a wallet/case.

## Purpose

Configure and launch a blockchain tracing investigation.

## Components

- `WalletSelector`
- `ChainSelector`
- `HopLimitSelector`
- `MinimumValueInput`
- `DateRangePicker`
- `InvestigationOptions`
- `StartButton`

## API

```http
POST /api/v1/investigations
```

## Input example

```json
{
  "case_id": "CASE-001",
  "chain": "ethereum",
  "start_address": "0xABC...",
  "max_hops": 4,
  "min_value": 10000,
  "from_date": "2026-01-01",
  "to_date": "2026-09-03"
}
```

## UX

Explain advanced options with small tooltips.

For example:

> Max hops = how many transaction relationships away from the starting wallet the system should analyze.

Do not make investigators understand graph theory before using the product.

---

# 11. Page 9 — Investigation Progress

## Route

```text
/investigations/{investigation_id}/progress
```

## Purpose

Show progress while a large investigation is running.

## Components

- `ProgressBar`
- `InvestigationStatus`
- `NodesFound`
- `EdgesFound`
- `CurrentStage`
- `CancelButton`
- `ErrorPanel`

## API

Poll:

```http
GET /api/v1/investigations/{investigation_id}
```

## Example

```text
Investigation Running

██████████████░░░░░░ 72%

Stage:
Building transaction graph

Nodes discovered: 18,421
Relationships:     32,810

Estimated remaining work: processing...
```

## UX

Never show a frozen screen while backend analysis is running.

The investigator must know whether:

```text
the system is working
the system is waiting
the system failed
the system completed
```

---

# 12. Page 10 — Investigation Graph

## Route

```text
/investigations/{investigation_id}/graph
```

## Purpose

This is the **main investigation workspace**.

It visualizes the movement of funds between addresses.

## Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Investigation Header                                       │
├─────────────┬───────────────────────────────────────────────┤
│ Filters     │                                               │
│             │               GRAPH CANVAS                    │
│ Risk        │                                               │
│ Asset       │       ●──────●──────●                         │
│ Min Value   │       │      │      │                         │
│ Entity      │       ●──────●      ●                         │
│             │                                               │
├─────────────┴───────────────────────────────────────────────┤
│ Selected Node / Transaction Details                         │
└─────────────────────────────────────────────────────────────┘
```

## Components

- `GraphCanvas`
- `GraphToolbar`
- `GraphFilters`
- `NodeDetailsPanel`
- `TransactionEdgeDetails`
- `RiskLegend`
- `EntityLegend`
- `PathHighlight`
- `ZoomControls`
- `FitGraphButton`

## API

```http
GET /api/v1/investigations/{investigation_id}/graph
```

## Node click

Fetch wallet details:

```http
GET /api/v1/wallets/{chain}/{address}
```

## Edge click

Fetch transaction:

```http
GET /api/v1/transactions/{chain}/{tx_hash}
```

## UX

### Node colors/visual states

Use a consistent semantic scheme:

```text
Suspect wallet       → highest visual emphasis
High risk            → strong warning
Medium risk          → moderate warning
Low risk             → neutral
Known VASP           → entity indicator
Unknown wallet       → neutral
```

Avoid using color alone; also use icons, labels or badges for accessibility.

### Important interaction

Clicking a node should:

```text
select node
→ highlight connected edges
→ open details panel
→ show risk/entity information
```

Clicking an edge should:

```text
select transaction
→ show amount
→ timestamp
→ tx hash
→ source
→ destination
```

---

# 13. Page 11 — Investigation Findings

## Route

```text
/investigations/{investigation_id}/findings
```

## Purpose

Convert a large transaction graph into a concise list of actionable findings.

## Components

- `FindingCard`
- `SeverityBadge`
- `EvidenceList`
- `ConfidenceBadge`
- `RelatedWallet`
- `OpenInGraphButton`

## API

```http
GET /api/v1/investigations/{investigation_id}/findings
```

## Example finding

```text
HIGH RISK

Funds reached a wallet associated with a known VASP.

Wallet:
0xABC...123

Confidence:
94%

Evidence:
Verified entity dataset

[Open in Graph]
```

## UX

Do not bury important findings inside the graph.

Investigators should be able to understand the main conclusions without manually inspecting hundreds of nodes.

---

# 14. Page 12 — Entity / VASP Explorer

## Route

```text
/entities
```

## Purpose

Search and inspect known organizations/entities associated with blockchain addresses.

## Components

- `EntitySearch`
- `EntityFilters`
- `EntityTable`
- `EntityDetailsDrawer`

## API

```http
GET /api/v1/entities/search
```

## Suggested columns

```text
Entity
Type
Jurisdiction
Risk
Known Addresses
Last Verified
```

---

# 15. Page 13 — Entity Detail

## Route

```text
/entities/{entity_id}
```

## Purpose

Display entity information and its associated addresses.

## Components

- `EntityHeader`
- `EntityMetadata`
- `AddressList`
- `EvidencePanel`
- `VerificationStatus`
- `RelatedInvestigations`

## API

```http
GET /api/v1/entities/{entity_id}
```

## UX

Every attribution should show:

```text
Entity
Confidence
Source
Last Verified
```

This is critical because address attribution is not always certain.

---

# 16. Page 14 — Risk Analysis

## Route

```text
/wallets/{chain}/{address}/risk
```

## Purpose

Explain why the system considers a wallet risky.

## Components

- `RiskScore`
- `RiskLevel`
- `RiskFactors`
- `FeatureTable`
- `ModelInformation`
- `RelatedTransactions`
- `OpenGraphButton`

## APIs

```http
POST /api/v1/risk/wallet
```

and:

```http
GET /api/v1/risk/wallet/{chain}/{address}/features
```

## UI example

```text
Risk Score
82 / 100
HIGH

Risk Factors

████████ Rapid forwarding
███████   High-risk counterparties
█████     Cross-chain activity
███       Short holding times

Model:
risk-model-v1
```

## UX

Explainability is more important than a fancy ML visualization.

The investigator should understand:

> Why did the model give this wallet a high score?

---

# 17. Page 15 — Cross-Chain Analysis

## Route

```text
/investigations/{investigation_id}/cross-chain
```

## Purpose

Show movement of assets between supported blockchains.

## Components

- `ChainFlowDiagram`
- `BridgeEventTable`
- `CrossChainPath`
- `ConfidenceBadge`
- `ChainFilter`

## APIs

```http
GET /api/v1/wallets/{chain}/{address}/cross-chain
```

and:

```http
POST /api/v1/cross-chain/trace
```

## UX

Show the chain transition clearly:

```text
Ethereum
   │
   │ Bridge
   ▼
Polygon
   │
   ▼
Exchange
```

Do not imply that two addresses are the same person merely because a cross-chain movement appears likely.

---

# 18. Page 16 — Fund Flow Analysis

## Route

```text
/investigations/{investigation_id}/fund-flow
```

## Purpose

Estimate how funds from a source transaction propagated through downstream transfers.

## Components

- `SourceTransactionSelector`
- `FundFlowPath`
- `AttributedAmount`
- `ConfidenceIndicator`
- `MethodSelector`
- `GraphLink`

## API

```http
POST /api/v1/investigations/{investigation_id}/fund-flow
```

## UX

Clearly distinguish:

```text
Observed blockchain transaction
```

from:

```text
Estimated fund attribution
```

Use labels such as:

> Estimated attribution: 75%

rather than:

> 75% of stolen money definitely went here.

---

# 19. Page 17 — Reports

## Route

```text
/reports
```

## Purpose

Manage generated investigation reports.

## Components

- `ReportTable`
- `ReportStatus`
- `ReportFilters`
- `DownloadButton`
- `GenerateReportButton`

## API

```http
POST /api/v1/reports
```

```http
GET /api/v1/reports/{report_id}
```

```http
GET /api/v1/reports/{report_id}/download
```

---

# 20. Page 18 — Generate Report

## Route

```text
/reports/new
```

## Purpose

Select investigation information to include in an official report.

## Components

- `InvestigationSelector`
- `ReportSections`
- `FormatSelector`
- `GenerateButton`

## Options

```text
☑ Transaction history
☑ Investigation graph
☑ Entity attribution
☑ Risk analysis
☑ Cross-chain analysis
☑ Fund-flow analysis
```

## API

```http
POST /api/v1/reports
```

## UX

Provide a preview of report contents before generation.

---

# 21. Page 19 — Global Search

## Route

```text
/search
```

## Purpose

Quickly locate a wallet, transaction, case or entity.

## Search examples

```text
0xABC123...
0xTransactionHash...
CASE-001
Exchange X
```

## APIs

Depending on query:

```http
GET /api/v1/wallets/search
GET /api/v1/entities/search
GET /api/v1/cases
```

Transaction lookup can use:

```http
GET /api/v1/transactions/{chain}/{tx_hash}
```

## UX

Make search globally accessible from the top navigation.

---

# 22. Page 20 — System / Admin Status

## Route

```text
/admin/system
```

## Purpose

For authorized administrators to monitor backend health.

## Components

- `ServiceStatus`
- `IndexerStatus`
- `DatabaseStatus`
- `QueueStatus`
- `MLServiceStatus`
- `SystemMetrics`

## API

```http
GET /api/v1/system/status
```

## Example

```text
Blockchain Indexer     ● Healthy
Database               ● Healthy
Investigation Queue    ● Healthy
ML Service             ● Healthy
```

This page should be hidden from normal investigators.

---

# 23. Important Reusable Components

Build these once and reuse them everywhere.

## Address

```text
<AddressDisplay />
```

Features:

- shortened address
- copy button
- chain icon
- external explorer link if allowed

## Risk Badge

```text
<RiskBadge score={82} />
```

Displays:

```text
HIGH
MEDIUM
LOW
```

## Transaction Row

```text
<TransactionRow />
```

Used in:

- wallet page
- transaction explorer
- investigation findings
- graph drawer

## Entity Badge

```text
<EntityBadge />
```

## Confidence Badge

```text
<ConfidenceBadge value={0.94} />
```

## Loading State

```text
<Skeleton />
```

## Investigation Progress

```text
<InvestigationProgress />
```

## Graph Node

```text
<WalletNode />
```

---

# 24. Frontend API Data Flow

The frontend should use a server-state library such as TanStack Query.

Example:

```text
WalletPage
    ↓
useWallet(chain, address)
    ↓
GET /wallets/{chain}/{address}
    ↓
Backend
    ↓
PostgreSQL / ClickHouse
```

For investigations:

```text
Start Investigation
       ↓
POST /investigations
       ↓
investigation_id
       ↓
poll GET /investigations/{id}
       ↓
completed
       ↓
GET /investigations/{id}/graph
       ↓
GET /investigations/{id}/findings
```

---

# 25. What Should Be Global State?

Keep global state small.

Recommended global state:

```text
authenticated user
theme
sidebar state
current case/investigation context
notifications
```

Do NOT put transaction lists, wallet details or graph data into a giant global Redux store by default.

Server data belongs in TanStack Query/server cache.

---

# 26. Suggested Frontend Folder Structure

```text
frontend/
│
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   └── providers.tsx
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Cases/
│   │   ├── Wallet/
│   │   ├── Investigation/
│   │   ├── Entities/
│   │   ├── Risk/
│   │   ├── CrossChain/
│   │   └── Reports/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── wallet/
│   │   ├── transaction/
│   │   ├── graph/
│   │   ├── risk/
│   │   ├── entity/
│   │   ├── investigation/
│   │   └── common/
│   │
│   ├── api/
│   │   ├── auth.ts
│   │   ├── cases.ts
│   │   ├── wallets.ts
│   │   ├── transactions.ts
│   │   ├── investigations.ts
│   │   ├── entities.ts
│   │   ├── risk.ts
│   │   └── reports.ts
│   │
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   └── styles/
│
└── tests/
```

---

# 27. Recommended Navigation

```text
Dashboard

Cases
├── All Cases
└── Create Case

Investigations
├── Active Investigations
└── Investigation History

Entities
└── Entity Search

Reports

Admin
└── System Status
```

Wallets should usually be accessed through:

```text
Case
   ↓
Wallet
```

or:

```text
Global Search
   ↓
Wallet
```

rather than making "Wallets" a huge standalone navigation section.

---

# 28. Main Investigator Workflow — UI Sequence

The most important workflow should look like:

```text
1. Investigator logs in
             ↓
2. Dashboard
             ↓
3. Create Case
             ↓
4. Enter suspect wallet
             ↓
5. Wallet Overview
             ↓
6. Start Investigation
             ↓
7. Investigation Progress
             ↓
8. Investigation Graph
             ↓
9. Click suspicious node
             ↓
10. Entity/VASP information
             ↓
11. Risk analysis
             ↓
12. Findings
             ↓
13. Generate Report
```

This workflow should be the primary UX design target.

---

# 29. MVP Frontend Pages

For SIH, do **not** build all 20 pages.

Build these first:

```text
1. Login
2. Dashboard
3. Cases
4. Case Detail
5. Wallet Overview
6. Transaction Explorer
7. Investigation Progress
8. Investigation Graph
9. Investigation Findings
10. Generate Report
```

The strongest demo flow is:

```text
Case
 ↓
Suspect Wallet
 ↓
Transactions
 ↓
Trace
 ↓
Graph
 ↓
VASP identification
 ↓
Risk score
 ↓
Findings
 ↓
Report
```

Everything else can be presented as future expansion.

---

# 30. Final UX Principles

### 1. Evidence first

The UI should always make it clear:

```text
What happened?
What does the blockchain prove?
What did our system infer?
How confident are we?
```

### 2. Progressive disclosure

Show the important information first.

Allow investigators to drill into:

```text
Wallet
 → Transaction
 → Evidence
 → Graph
 → Entity
 → Risk
```

### 3. Explainability

Every automated conclusion should have a visible explanation.

### 4. Avoid dashboard clutter

This is an investigation tool, not a crypto trading dashboard.

### 5. Preserve investigation context

The user should always know:

```text
Current Case
Current Wallet
Current Investigation
```

### 6. Design for large datasets

Tables need:

```text
pagination
filters
sorting
search
virtualization where required
```

### 7. Never hide uncertainty

Use:

```text
Confirmed
Observed
Associated
Estimated
Inferred
High confidence
Low confidence
```

appropriately.

### 8. Optimize for investigator speed

The ideal UX should reduce:

```text
searching
copying addresses
switching tabs
manually following transactions
manually documenting evidence
```

and increase:

```text
finding
verification
comparison
decision-making
reporting
```
