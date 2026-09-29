# PRD Compliance Matrix

This document tracks the actual API endpoints implemented in the backend application, confirming their alignment with the PRD requirements.

## Current Controller Mappings

| HTTP Method | Endpoint | Controller | Notes |
|-------------|----------|------------|-------|
| POST | /api/v1/auth/login | AuthController | Auth |
| GET | /api/v1/auth/me | AuthController | Auth |
| GET | /api/v1/wallets/{chain}/{address} | BlockchainController | PRD Required |
| GET | /api/v1/wallets/{chain}/{address}/statistics | BlockchainController | PRD Required |
| GET | /api/v1/wallets/{chain}/{address}/transactions | BlockchainController | PRD Required |
| GET | /api/v1/transactions/{chain}/{txHash} | BlockchainController | PRD Required |
| POST | /api/v1/cases | CaseController | PRD Required |
| GET | /api/v1/cases | CaseController | PRD Required |
| GET | /api/v1/cases/{caseId} | CaseController | PRD Required |
| PATCH | /api/v1/cases/{caseId} | CaseController | PRD Required |
| POST | /api/v1/cases/{caseId}/wallets | CaseController | |
| GET | /api/v1/cases/{caseId}/wallets | CaseController | |
| POST | /api/v1/cases/{caseId}/vasp-requests | VaspRequestController | PRD Required |
| GET | /api/v1/cases/{caseId}/vasp-requests | VaspRequestController | PRD Required |
| GET | /api/v1/entities/address/{chain}/{address} | EntityController | PRD Required |
| GET | /api/v1/investigations/{investigationId}/findings | FindingController | |
| POST | /api/v1/investigations | InvestigationController | |
| GET | /api/v1/cases/{caseId}/investigations | InvestigationController | |
| GET | /api/v1/investigations/{investigationId} | InvestigationController | |
| GET | /api/v1/investigations/{investigationId}/graph | InvestigationController | |
| POST | /api/v1/investigations/{investigationId}/cancel | InvestigationController | |
| GET | /api/v1/investigations/{investigationId}/attribution | InvestigationController | |
| POST | /api/v1/reports | GlobalReportController | PRD Required |
| GET | /api/v1/reports | GlobalReportController | PRD Required |
| GET | /api/v1/reports/{reportId} | GlobalReportController | PRD Required |
| GET | /api/v1/reports/{reportId}/download | GlobalReportController | PRD Required |
| POST | /api/v1/investigations/{investigationId}/reports | ReportController | Legacy / Specific |
| GET | /api/v1/investigations/{investigationId}/reports | ReportController | Legacy / Specific |
| GET | /api/v1/investigations/{investigationId}/reports/{reportId}/download | ReportController | Legacy / Specific |
| GET | /api/v1/risk/scores/{chain}/{address} | RiskController | |
| POST | /api/v1/risk/wallet | RiskController | |

## Findings Generation Matrix

| FINDING | IMPLEMENTED/PARTIAL/MISSING | GENERATING METHOD | TEST |
|---------|-----------------------------|-------------------|------|
| VASP_EXPOSURE | IMPLEMENTED | AttributionEngine.evaluateVaspAttribution | AttributionEngineExtraTest.testDirectVasp |
| RAPID_FORWARDING | IMPLEMENTED | RuleBasedRiskScorer.evaluateRules | RuleBasedRiskScorerTest.testRapidForwarding |
| LARGE_TRANSFER | IMPLEMENTED | RuleBasedRiskScorer.evaluateRules | RuleBasedRiskScorerTest.testLargeTransfer |
| FAN_OUT | IMPLEMENTED | RuleBasedRiskScorer.evaluateRules | AttributionEngineExtraTest.testLargeFanOut |
| FAN_IN | IMPLEMENTED | AttributionEngine.evaluateFanIn | AttributionEngineExtraTest.testFanIn |
| MIXER_EXPOSURE | IMPLEMENTED | AttributionEngine.evaluateVaspAttribution | AttributionEngineTest.testMixerExposure |
| BRIDGE_USAGE | IMPLEMENTED | AttributionEngine.evaluateVaspAttribution | AttributionEngineTest.testBridgeUsage |
| HIGH_RISK_COUNTERPARTY | IMPLEMENTED | RuleBasedRiskScorer.evaluateRules | RuleBasedRiskScorerTest.testHighRiskCounterparty |

## Verification Status
- Wallet Transaction query parameters direction, sset, romDate, 	oDate, minValue, page, limit verified in TransactionQuery.java.
- iskScore logic removed from attribution candidate sorting in AttributionEngine.java. Sort order strictly adheres to: hop_count ASC, evidence quality DESC, confidence DESC, amount DESC.
- Amount tracking modified to BigDecimal throughout provider, dto, persistence, engine, and scorer logic to ensure precise values without float binary drift.
- Graph traversal explicitly separates edge persisting from node traversal to prevent Graph Visited-Node corruption. 
- Unit tests added and covering endpoints, algorithms, and security checks.
- Postgres Validation is skipped as Docker cannot be instantiated in the provided runtime environment.
