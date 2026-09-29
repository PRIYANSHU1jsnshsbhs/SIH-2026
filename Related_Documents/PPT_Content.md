# SIH 2026 — Blockchain Fraud Attribution Platform
## PPT Content Plan (Excluding Technical Approach)

> **Design reference:** Your 2025 LogicX decks use a very specific style: short factual blocks, diagrams/infographics, one strong visual per slide, and minimal paragraph text.  
> The new deck should keep that strength but avoid unsupported numerical claims.

---

# Slide 1 — TITLE

## REAL-TIME CRYPTO FRAUD ATTRIBUTION SYSTEM

### Automated Blockchain Tracing & VASP Intelligence for Law Enforcement

**Problem Statement:** 26182  
**Domain:** Blockchain & Cybersecurity  
**Category:** Software  
**Team:** LogicX

### Visual

Keep this slide extremely clean.

**Center:**
- Large title
- Subtitle underneath

**Right / bottom-right:**
- Blockchain network → suspicious wallet → exchange/VASP → investigator dashboard illustration

**Bottom:**
- Team / institute / SIH branding

### Do NOT add

- Long problem description
- Technology stack
- Too many logos
- Multiple paragraphs

---

# Slide 2 — THE PROBLEM + OUR SOLUTION

## THE PROBLEM

### Why current investigation is difficult

**Raw blockchain data is public — but investigative intelligence is not.**

- Victims often provide only a **suspect wallet address**
- Funds move through **multiple intermediary / burner wallets**
- Manual tracing becomes difficult across **thousands of transactions**
- **Multi-chain transfers, bridges and DeFi** fragment the trail
- Wallet addresses do not directly reveal the **real-world owner**
- Investigators need to identify the **nearest exchange / VASP** receiving the funds

### Impact

**Hours of manual tracing → delayed freezing, evidence preservation and fund recovery**

---

## OUR SOLUTION

### One platform from wallet address → actionable intelligence

```text
Reported Wallet
      ↓
Automatic Blockchain Tracing
      ↓
Transaction / Fund-Flow Graph
      ↓
Multi-Hop + Cross-Chain Analysis
      ↓
Risk & Pattern Detection
      ↓
Entity / VASP Identification
      ↓
Investigation Findings + Report
```

### Bottom callout

**From “Where did the money go?” → “Which path, entity and evidence should the investigator pursue?”**

### Recommended layout

Use a **two-column slide**:

```text
┌──────────────────────┬──────────────────────────┐
│      THE PROBLEM     │       OUR SOLUTION       │
│                      │                          │
│ 5–6 short points     │ Wallet → Graph → AI     │
│                      │ → VASP → Report         │
│                      │                          │
│       ⚠️             │      🔍 → 🕸 → 🤖 → 🏢 │
└──────────────────────┴──────────────────────────┘
```

Put a small visual in the center/bottom showing:

**Victim Complaint → Wallet → Many Wallets → VASP**

---

# Slide 3 — HOW THE INVESTIGATOR USES IT

## FROM COMPLAINT TO INVESTIGATION

This slide should be **workflow-first**, not another architecture slide.

### Investigator Workflow

```text
01
CREATE CASE
   ↓
02
ENTER SUSPECT WALLET
   ↓
03
SYSTEM LOADS TRANSACTIONS
   ↓
04
TRACE FUND FLOW
   ↓
05
RANK SUSPICIOUS PATHS
   ↓
06
IDENTIFY ENTITY / VASP
   ↓
07
REVIEW EVIDENCE
   ↓
08
GENERATE REPORT
```

### What the investigator sees

Use 4 visual cards:

**TRANSACTION TIMELINE**
- Incoming / outgoing transfers
- Amount
- Timestamp
- Counterparty

**INTERACTIVE GRAPH**
- Wallets
- Transfers
- Fund-flow paths
- Risk-highlighted nodes

**RISK INTELLIGENCE**
- Risk score
- Suspicious behavior
- High-risk exposure
- Confidence

**ENTITY / VASP**
- Known exchange/VASP
- Address label
- Attribution source
- Confidence

### Visual idea

Create a **mock investigator dashboard** occupying ~55–60% of the slide.

Inside the mockup:

```text
Case #CR-1024

Suspect Wallet
0x7A...91F

Risk: HIGH

        ● Wallet A
       /           \
 Victim ●           ● Mixer/Intermediary
       \           /
        ● Exchange / VASP

Top Finding:
Funds reached a known VASP
after 3 intermediary hops.
```

Use the remaining ~40% for the 8-step workflow.

### Key message

> **The investigator does not manually inspect the entire blockchain — the system narrows millions of records into relevant investigative paths.**

---

# Slide 4 — FEASIBILITY & VIABILITY

## WHY THIS CAN ACTUALLY BE BUILT

Use the same four-section structure that worked well in your 2025 PPT.

---

## TECHNICAL FEASIBILITY

**Existing blockchain infrastructure**
- Blockchain RPCs / indexing APIs provide transaction data
- Event/log decoding enables structured transfer extraction
- Graph databases support multi-hop relationship queries

**Scalable architecture**
- Asynchronous ingestion workers
- Separate transaction, metadata and graph storage
- API-based modular services

**AI/ML readiness**
- Rule engine works without labelled datasets
- Classical ML can use engineered wallet/transaction features
- GNN can be introduced after sufficient graph-labelled data is available

---

## OPERATIONAL FEASIBILITY

- Investigator starts with a **wallet address or case**
- Automated tracing reduces manual blockchain exploration
- Evidence and attribution sources remain visible
- Human investigator remains in the decision loop
- Standardized reports can support existing LEA workflows

---

## ECONOMIC VIABILITY

### MVP

| Component | Estimated Cost |
|---|---:|
| Software development | ₹3–6 L |
| Cloud / database / queues | ₹0.5–1.5 L / year |
| Blockchain indexing / RPC | ₹0.5–2 L / year |
| ML / graph infrastructure | ₹0.5–1.5 L / year |
| **Estimated Year-1 MVP** | **₹4.5–11 L** |

> **Note:** Final cost depends heavily on number of chains, transaction volume, indexing strategy and whether dedicated nodes are operated.

### Cost-saving strategy

**Start with indexing APIs + managed infrastructure → move high-volume workloads to dedicated infrastructure as usage grows.**

---

## KEY RISKS & MITIGATION

| Challenge | Mitigation |
|---|---|
| Unknown wallet owner | Entity intelligence + confidence/source tracking |
| Huge transaction volume | Pre-indexing + graph filtering + caching |
| Cross-chain complexity | Chain-specific adapters + bridge correlation |
| False positives | Rules + ML + explainable evidence |
| Model/data limitations | Human-in-the-loop + staged GNN adoption |

### Recommended visual

Use a **4-quadrant layout**:

```text
┌──────────────────┬──────────────────┐
│ TECHNICAL        │ OPERATIONAL      │
│ ✓ RPC/Indexing   │ ✓ LEA workflow   │
│ ✓ Graph DB       │ ✓ Human review   │
│ ✓ ML/GNN         │ ✓ Reports        │
├──────────────────┼──────────────────┤
│ ECONOMIC         │ RISKS            │
│ ₹4.5–11 L MVP    │ Data gaps        │
│ Modular scaling  │ False positives  │
│ API-first start  │ Cross-chain      │
└──────────────────┴──────────────────┘
```

---

# Slide 5 — IMPACT & BENEFITS

## FROM RAW TRANSACTIONS TO ACTIONABLE INTELLIGENCE

### Comparative Perspective

| Current Investigation | Proposed Platform |
|---|---|
| Manual wallet tracing | Automated multi-hop tracing |
| Explorer-by-explorer analysis | Unified investigation workspace |
| Difficult graph reconstruction | Interactive transaction graph |
| Manual entity lookup | Automated VASP/entity intelligence |
| Separate cross-chain investigation | Unified cross-chain workflow |
| Analyst-dependent prioritization | Risk-ranked paths & wallets |
| Manual report preparation | Standardized evidence report |

---

## INVESTIGATIVE BENEFITS

### ⚡ Faster Investigation
Reduce time spent manually navigating large transaction histories.

### 🎯 Better Prioritization
Surface suspicious wallets, paths and entities first.

### 🔗 Complete Fund-Flow Visibility
Follow funds across intermediary wallets and supported chains.

### 🏢 Faster VASP Identification
Highlight known exchange/VASP exposure and attribution confidence.

### 🧾 Evidence-Backed Findings
Every important finding links back to observable blockchain activity.

### 📈 Scalable Intelligence
The same indexed dataset can support thousands of investigations.

---

## KEY VISUAL — BEFORE vs AFTER

Use a split-screen graphic.

### BEFORE

```text
Complaint
   ↓
Explorer 1
   ↓
Wallet A
   ↓
Explorer 2
   ↓
Wallet B
   ↓
Manual notes
   ↓
VASP search
   ↓
Report
```

Label:

**Fragmented + Manual + Time-Consuming**

### AFTER

```text
              ┌─ Wallet A ─┐
Complaint → Platform → Wallet B → VASP
              └─ Wallet C ─┘
                    ↓
             Risk + Evidence
                    ↓
                 Report
```

Label:

**Unified + Automated + Explainable**

---

## Optional small KPI-style callouts

Use **capability metrics**, not fake measured performance:

```text
MULTI-HOP
Tracing

CROSS-CHAIN
Analysis

VASP / ENTITY
Intelligence

AI / ML
Risk Analysis

EVIDENCE
Reports
```

Do **not** claim things such as “90% faster”, “₹X crore saved”, or “99% accuracy” unless you have actually measured them on representative data.

---

# Slide 6 — RESEARCH & REFERENCES

## RESEARCH & REFERENCES

Keep this slide visually simple, just like the 2025 deck.

### Primary / Official Sources

- Smart India Hackathon — Problem Statement 26182
- National Cyber Crime Reporting Portal (NCRP)
- Ministry of Home Affairs / Cybercrime resources
- Indian Cyber Crime Coordination Centre (I4C)
- FIU-IND — Virtual Digital Asset / AML guidance
- FATF — Virtual Assets & VASPs
- RBI — Virtual Digital Assets / regulatory references where applicable

### Blockchain / Technical Sources

- Ethereum Developer Documentation
- Bitcoin Developer Documentation
- Hyperledger / blockchain investigation references where relevant
- Neo4j Graph Data Science documentation
- PyTorch Geometric documentation
- scikit-learn documentation

### Research Areas

```text
Blockchain Forensics
Graph Analytics
Cryptocurrency AML
VASP Attribution
Anomaly Detection
Cross-Chain Analysis
Graph Neural Networks
Digital Evidence
```

### Visual layout

Use **two columns**:

```text
┌─────────────────────────┬─────────────────────────┐
│ OFFICIAL / POLICY       │ TECHNICAL / RESEARCH    │
│                         │                         │
│ NCRP                    │ Ethereum Docs           │
│ I4C                     │ Bitcoin Docs            │
│ FIU-IND                 │ Neo4j GDS               │
│ FATF                    │ PyTorch Geometric       │
│ RBI                     │ scikit-learn            │
└─────────────────────────┴─────────────────────────┘
```

At the bottom, add a QR code linking to the complete references / GitHub repository if available.

---

# VISUAL LANGUAGE FOR ALL SLIDES

Your previous LogicX decks succeeded partly because they were **visual rather than text-heavy**. Keep that.

## Use

- Dashed rounded boxes
- Strong section headers
- Blue arrows for system/data flow
- Red for suspicious/high-risk entities
- Green for verified/known entities
- Black/gray for architecture
- Simple line icons
- One major visual per slide
- Short phrases instead of paragraphs

## Avoid

- Large paragraphs
- Huge technology-logo walls
- Generic stock photos
- 10+ different colors
- Tiny text
- Decorative diagrams with no information
- Unverified statistics

---

# RECOMMENDED SLIDE FLOW

The final presentation should tell a simple story:

```text
SLIDE 1
WHAT ARE WE BUILDING?
        ↓
SLIDE 2
WHY IS IT NEEDED?
        ↓
SLIDE 3
HOW DOES AN INVESTIGATOR USE IT?
        ↓
SLIDE 4
CAN WE ACTUALLY BUILD & SCALE IT?
        ↓
SLIDE 5
WHAT CHANGES IF WE DEPLOY IT?
        ↓
SLIDE 6
WHAT IS OUR RESEARCH BASIS?
```

Technical Approach remains between Slides 3 and 4 as the detailed architecture slide already prepared separately.

---

# IMPORTANT CONTENT DECISIONS

## 1. Do not make “AI” the headline

The real product is:

**Blockchain Intelligence + Investigation Graph + Entity Attribution**

AI/ML/GNN improves prioritization and detection.

---

## 2. Do not claim blockchain reveals identity

The system can identify a **known or attributed entity/VASP** when supporting intelligence exists.

For an unknown self-custody wallet:

```text
Wallet Address
      ↓
Transaction Evidence
      ↓
Behavior / Graph Analysis
      ↓
Known Entity Exposure?
      ↓
YES → Attribution
NO  → Unknown / Investigative Lead
```

This distinction will make the presentation technically credible.

---

## 3. Do not claim “fraud detected” from a score alone

Use:

**Risk / Suspicion / Investigative Lead**

rather than:

**Confirmed Fraudster**

The final determination remains with investigators.

---

## 4. The strongest product story

The strongest single sentence for the PPT is:

> **“Our platform converts a reported crypto wallet address into an explainable fund-flow investigation — tracing transactions, ranking suspicious paths, identifying known entities/VASPs and producing evidence-backed intelligence for law enforcement.”**

---

# FINAL SLIDE-BUILDING PRIORITY

If you have limited time, prioritize the visuals in this order:

1. **Slide 2:** Problem → Solution visual
2. **Slide 3:** Investigator workflow + dashboard mockup
3. **Technical Approach:** Full architecture
4. **Slide 5:** Before vs After comparison
5. **Slide 4:** Feasibility matrix
6. **Slide 6:** References

The judges should understand the product **before** they see the technology.
