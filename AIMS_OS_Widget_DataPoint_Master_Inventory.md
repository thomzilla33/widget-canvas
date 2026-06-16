# AIMS OS — Widget Data-Point Master Inventory

**Purpose:** the full universe of data points that could be bound to a dashboard/UCP widget, across every internal platform domain plus external connector data. This is the *menu* — the superset. The endpoint mapping and build status for each live in the companion v2 catalog; this document is exhaustive enumeration, not sequencing.

**Tags:** **D** = Dimension (categorical/time — group-by, filter, axis). **M** = Measure (numeric — count, sum, avg, rate, p95). Where known, the backing table/field is named.

**Standing guardrails** (carry from the catalog): endpoint-side PBAC scoping; Truth vs Sandbox labeling; unified credit pool only (never the GE-COMM/FIN/COMP split); token usage is observability-only and **not yet instrumented**; Bridge ID citations on governance/value measures; tiles register with Dashboard Builder (type + default size).

---

## 1. Agentic Workflow & Node Execution
*Backing: `aik_execution_logs`, `aik_action_instances`, `aik_action_instance_versions`, AMP registry, WorkflowSpec.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Workflow id / name | D | WorkflowSpec / action instance |
| Workflow version | D | pinned spec version |
| Parent / child workflow | D | Parent/Child Registry |
| Network / agentic-network id | D | Agentic Networks module |
| Node id | D | per-node |
| Node type | D | Tool, Policy Gate, Grounding Verify, Dispatch, Writeback, Router, Bind, HITLApproval, Audit Emit, etc. |
| Node health state | D | per DS-274 node health |
| Agent id / role | D | conductor / worker / narrow |
| `invoked_by_type` | D | AGENT / USER / WORKFLOW / TRIGGER / SYSTEM |
| `invoked_by_id` | D | the invoking entity |
| Trigger source | D | schedule / webhook / manual / event |
| `status` | D | RUNNING / SUCCESS / FAILED / CANCELLED |
| Environment | D | prod / sandbox / dev |
| Tenant / team / department | D | rollup scope |
| `started_at` / `finished_at` | D (time) | run window |
| Workflow runs | M | count of `aik_execution_logs` rows |
| Node executions | M | per-node run count |
| Success count / rate | M | status = SUCCESS |
| Error / failure count / rate | M | status = FAILED + `error_context` |
| Cancelled count | M | status = CANCELLED |
| In-flight / running now | M | status = RUNNING |
| Escalation count / rate | M | runs that fired HITL/Council escalate |
| Avg run latency | M | `finished_at − started_at` |
| p50 / p95 / p99 latency | M | distribution |
| Avg node latency | M | per-node from `run_metadata` |
| Retry count / retry rate | M | `run_metadata.attempts` |
| Avg confidence score | M | per-node confidence (threshold 0.65) |
| Low-confidence run count | M | below configured threshold |
| Tool calls per run | M | count |
| Distinct tools invoked | M | cardinality |
| Cache hit rate | M | Toolv2 span attribute |
| Throughput (runs / time) | M | runs per hour/day |
| Aging / stale runs | M | RUNNING beyond threshold |
| Token usage | M | *planned — not yet instrumented (CT-3379 backlog)* |
| Workflow-level span / latency rollup | M | *blocked — per-tool spans only today* |

---

## 2. Actions, Tools & Catalog
*Backing: `stt_actions`, `stt_tools`, `stt_action_tools` (core `ann_system_core`), `aik_agent_action_instances`.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Action id / name | D | `stt_actions` |
| Action `direction` | D | inbound / outbound |
| Tool id / name | D | `stt_tools` (SQL Runner, Email Sender, Webhook, …) |
| Action ↔ tool role / step | D | `stt_action_tools.metadata.role` / `step` |
| Action instance id | D | tenant `aik_action_instances` |
| Action instance status | D | `status`, `active` |
| Action instance version | D | `aik_action_instance_versions.version_number` |
| Owner / created_by | D | catalog ownership |
| Actions defined | M | catalog size |
| Action instances provisioned | M | per tenant |
| Agent ↔ action assignments | M | `aik_agent_action_instances` |
| Action executions | M | links to execution logs |
| Version snapshots taken | M | rollback/audit volume |
| Tools active / inactive | M | `active` flag |

---

## 3. Council & Governance Gates
*Backing: ActionGateDecision records, Council decisions, Audit Emit, policy ruleset.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Action type | D | message/log/classify, standard, financial, compliance |
| Council outcome | D | PASS / BLOCK / DEGRADE / ESCALATE |
| Policy rule fired | D | which rule |
| Confidence band | D | bucketed |
| Risk tier | D | workflow risk profile |
| Workflow / agent | D | attribution |
| Action gate decisions | M | = total GE |
| PASS / BLOCK / DEGRADE / ESCALATE counts | M | per outcome |
| % by outcome | M | governance posture mix |
| BLOCK count | M | incidents-avoided signal → Value Ledger I_n |
| DEGRADE count | M | active risk management |
| Hallucination / grounding-fail flags | M | Grounding Verify failures |
| Citation-missing flags | M | governed-output without citation |
| Kill-switch / pause events | M | agent/workflow halts |
| Confidence-validation escalations | M | below threshold |
| Auth / permission decisions logged | M | *blocked — not yet implemented (CT-3379)* |
| *Guardrail* | — | roll up to one GE; never expose COMM/FIN/COMP |

---

## 4. Truth Plane / Knowledge Base (Facts)
*Backing: `aia_fact`, `aia_fact_version` (core_ai / tnt_[id] federated), KCON, Truth Promotions.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Fact id | D | `aia_fact` |
| Fact `status` | D | ACTIVE / PUBLISHED / deprecated |
| Truth tier | D | T0 / T1 / T2 / T3 |
| Scope | D | Local / Org-Group / Global |
| Fact domain / type | D | ontology grouping |
| Source / provenance | D | lineage to document |
| Attested_by | D | attestor identity |
| `valid_from` / `expires_at` / `expired_at` | D (time) | lifecycle gates |
| `approved_at` / `approved_by_role` | D | governance |
| `deprecated_at` | D | retired facts |
| Active fact count | M | live attested facts |
| Published fact count | M | status = PUBLISHED |
| TP count (truth writes) | M | promotions in period |
| Facts approaching TTL | M | freshness early-warning |
| Stale / expired fact count | M | past `expires_at` |
| Deprecated fact count | M | `deprecated_at` set |
| Attestation events | M | human attestations |
| Re-attestation events | M | → Value Ledger A_n |
| Train Me corrections | M | → Value Ledger C_n |
| Candidate facts pending promotion | M | Sandbox → Truth backlog |
| Change requests open / approved | M | governance workflow |
| Avg fact confidence | M | `confidence` |
| TR (Truth Retrieval) volume | M | citation-locked retrievals (free) |
| Fact versions created | M | `aia_fact_version` churn |

---

## 5. Sandbox Plane & DIAN Claims
*Backing: DIAN pipeline, candidate claims, structured claim catalog (7 types).*

| Data point | D/M | Backing / notes |
|---|---|---|
| Claim id | D | candidate claim |
| Claim type | D | one of 7 structured types + unstructured |
| DIAN stage | D | intake → normalize → extract → bind |
| Source document | D | lineage |
| Sensitivity tier | D | PII / regulated classification |
| Confidence | D | bucketed |
| Candidate claims generated | M | DIAN output |
| Claims pending review | M | curation backlog |
| Claims promoted to Truth | M | conversion |
| Claims rejected / conflicted | M | conflict resolution |
| SRAG (Sandbox RAG) volume | M | non-authoritative retrieval (labeled) |
| AHRAG (Ad Hoc) volume | M | never-promotable retrieval |

---

## 6. Drives, Documents & Knowledge Content
*Backing: `aia_dr_vaults`, `aia_dr_folders`, `aia_dr_documents`, `aia_dr_document_versions`, `aia_dr_document_chunks`, `aia_dr_*_summaries`, `aia_dr_document_extractions`, `aia_dr_topics`. UI `/v2/drives`; API `POST /v1/tenant/vault/list`.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Drive (vault) name | D | `aia_dr_vaults` |
| Drive scope | D | USER / MANAGE |
| Drive status | D | Active / Archived |
| Drive category | D | My Drive / Shared With Me / Company Drive |
| Owner / creator | D | acl_users |
| Last updated | D (time) | most recent change |
| Folder | D | `aia_dr_folders` (nested) |
| Document | D | `aia_dr_documents` |
| File type | D | PDF / DOCX / CSV / … |
| Document language / sync status | D | `aia_dr_document_versions` |
| Link type | D | PHYSICAL / LOGICAL (alias) |
| Topic | D | `aia_dr_topics` (semantic) |
| Workflow Drive | D | WD-{id}-{name}, 1:1 with workflow |
| Drives count | M | per scope / category |
| Folder count | M | `aia_dr_vault_summaries` |
| Document count | M | per drive/folder (summaries) |
| File size | M | per file / drive total |
| Document versions | M | version churn |
| Chunks generated | M | `aia_dr_document_chunks` |
| Extractions count | M | `aia_dr_document_extractions` |
| Avg extraction confidence | M | bounding-box confidence |
| Documents in DIAN / in Sandbox | M | pipeline-metrics row (CT-2784) |
| Associated claims | M | pipeline-metrics row |
| Files added / removed (period) | M | activity |
| Documents per agent | M | agent knowledge assignment |

---

## 7. Table Definition Primitive
*Backing: `stt_data_tables`, `stt_table_fields`.*

**Health**

| Data point | D/M | Backing / notes |
|---|---|---|
| Table name / owner | D | `stt_data_tables` |
| Scope | D | GLOBAL / TENANT / team |
| View preset | D | grid / form / matrix |
| Source template | D | seeding template |
| `freshness_state` | D | fresh / approaching-TTL / stale |
| `ttl_duration` | D | owner-set clock |
| Table count | M | inventory |
| Field count | M | `stt_table_fields` |
| Tables stale / approaching TTL | M | governance risk |
| Refresh tasks open / overdue | M | owner accountability |
| Consumers bound | M | blast radius |
| Workflows paused on stale data | M | default-pause firing |
| `last_refreshed_at` age | M | per-table |

**Contents-as-source:** every user-authored table (KPI set, routing matrix, scoring rubric, comp plan, reference list) is directly chartable via the SQL Runner; each field auto-types to D/M by `data_type`.

---

## 8. Human-Touch Layer (HTL)
*Backing: HTL ticket records, packs, 12-metric SLA engine, comms-hub monitoring (CT-3358).*

**Dimensions**

| Data point | D/M |
|---|---|
| Pack / pack version | D |
| Channel (webchat/SMS/email/voice) | D |
| Handoff destination (External / AIMS Internal / Lightweight) | D |
| Team / employee | D |
| Status / priority / customer tier | D |
| Escalation reason | D |
| Breach severity (warning/soft/hard/critical) | D |
| Pause reason | D |
| Jurisdiction / compliance-marked | D |

**Measures — volume & state**

| Data point | M |
|---|---|
| Tickets (count) | M |
| Queue depth (live, by status) | M |
| Active employees by state (Available/Busy/Away/Offline) | M |
| Handoffs fired (by destination) | M |
| Macro executions (customer-facing vs internal) | M |
| OOO coverage activations | M |
| Webhook fires | M |
| Vulnerable-customer escalations | M |
| Recording-consent sessions | M |
| Compliance disclosures produced | M |

**Measures — the 12 SLA metrics**

| Data point | M |
|---|---|
| Time to assign | M |
| Time to acknowledge | M |
| Time to first response | M |
| Time to first action | M |
| Time to resolution (MTTR) | M |
| Customer wait time | M |
| Time between responses | M |
| Total handle time | M |
| After-call work time | M |
| Hold time | M |
| Queue time | M |
| SLA-pause time | M |

**Measures — SLA performance & quality**

| Data point | M |
|---|---|
| SLA compliance rate (per pack/channel/team/employee/time) | M |
| Breach frequency / rate | M |
| Breach by reason / pack / channel / employee / time-of-day | M |
| Target vs actual distribution | M |
| Forecasted SLA risk (v1.1) | M |
| Per-employee scorecard signals | M |
| AI quality score (v1.1) | M |
| Coaching notes count | M |
| Widget conversion metrics | M |
| Active routing-rule effectiveness | M |
| Integration health | M |
| HTL GE consumed | M |

---

## 9. Conversations & Messages
*Backing: `aik_conversations`, `aik_messages`, `aik_message_features`, `aik_message_references`, `aik_widgets_catalog`. WebSocket transport.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Conversation id / status | D | `aik_conversations` (ACTIVE/…) |
| Channel | D | conversation channel |
| Participant role | D | HUMAN / CUSTOMER / USER / AGENT / AI |
| Message feature type | D | LINK/IMAGE/VIDEO/AUDIO/CITATION/CODE/TABLE/ATTACH_REF/INLINE_REF |
| Reference kind | D | SOURCE / RESOURCE / CONTEXT / ATTACHMENT |
| Conversations (count) | M | volume |
| Active conversations | M | status = ACTIVE |
| Messages (count) | M | `aik_messages` |
| Agent vs human message split | M | autonomy ratio |
| `last_message_at` | M (time) | recency |
| Citations attached | M | RAG provenance (`ref_kind=SOURCE`) |
| Attachments shown | M | `ref_kind=ATTACHMENT` |
| Knowledge chunks surfaced | M | WS `knowledge_chunk` events |
| Reasoning steps streamed | M | WS `reasoning` events |
| HITL events | M | input.required / input.updated |
| Avg response time | M | message gap |

---

## 10. UCP / Entity & Customer Objects
*Backing: UCP module, party tables (`krn_parties`, `krn_party_emails`, `krn_party_phones`, `krn_party_addresses`), entity resolution. Vertical objects (vehicles/appointments/ROs) are connector-fed but surface on the UCP.*

**Identity & contact**

| Data point | D/M |
|---|---|
| Entity / entity type | D |
| Name, Company | D |
| Email (primary + count), Phone (primary + count) | D / M |
| Address, City, State, Postal Code | D |
| Avatar present | D |
| Last interaction | D (time) |
| Profile completeness | M |
| Entity count (by type) | M |
| Unified entities / source records | M |
| Identity merges | M |

**Activity & insight (UCP tabs)**

| Data point | D/M |
|---|---|
| Activity type (Email / SMS / Notes / Calls) | D |
| Activities (count, by type) | M |
| Notes count | M |
| AI insight: summary present | D |
| Opportunities (lease renewal / upgrade / cross-sell / referral / tech-adoption) | M |
| Personality / communication-preference tags | D |

**Vertical business objects (auto example — vehicles vertical)**

| Data point | D/M |
|---|---|
| Garage: vehicles owned / models of interest | M / D |
| Appointments (scheduled / past) | M |
| Repair orders (open / closed) | M |
| Tasks (open / completed / overdue) | M |
| Task status / due date | D |

*Note: the vertical-object set is connector-defined and varies by industry (REI, financial services, etc.); these are illustrative of the pattern, not a fixed list.*

---

## 11. Agents & Workforce (AMP / PA network / NBA)
*Backing: `aia_ag_agents`, `agent_versions`, AMP registry, PA mesh, NBA agentic network.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Agent id / name | D | `aia_ag_agents` |
| Agent class | D | User PA / Manager / Director / Council / NBA / narrow |
| Agent type | D | human / AI / service |
| Status | D | active / paused |
| Capability scope | D | granted assets (docs/vaults/topics/instructions) |
| Registry / config version | D | `agent_versions` |
| Team / manager | D | org structure |
| Agents registered / active | M | workforce size |
| Agent run count | M | activity per agent |
| Escalations to Council | M | by class |
| NBA actions triggered | M | Next Best Action volume |
| NBA suppressed messages | M | suppression-logic firing |
| Manager-PA: completed tasks | M | team rollup |
| Manager-PA: customers engaged | M | team rollup |
| Manager-PA: open loops | M | team rollup |
| KPIs moved / impacted | M | team rollup |

---

## 12. Credits, Billing & Consumption
*Backing: ChargeRecords / rating engine, GE + TP primitives. Tenant-facing = unified pool.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Workflow / agent / team | D | cost attribution |
| Action type burn tier | D | simple 1 / standard 3 / financial 5 / compliance 10 / TP T1 2 / TP T2–T3 5–15 |
| Environment | D | prod / sandbox / dev |
| Period | D (time) | billing window |
| Credits consumed (unified) | M | headline cost |
| GE count | M | governed actions |
| TP count | M | truth writes |
| TP by tier (T0–T3) | M | internal (premium pricing) |
| Burn rate by action type | M | capacity allocation |
| Overage credits | M | COMM/TP overage |
| Balance remaining | M | runway |
| Projected burn / forecast | M | runway projection |
| Plan tier | D | Suite Launch/Growth/Scale/Enterprise |
| Plan credit allocation | M | 10K/50K/150K |
| Token usage (efficiency only) | M | *not yet instrumented — separate tile when available* |
| *Guardrail* | — | unified pool only; thinking is free (reasoning/RAG/Sandbox/drafting/normalization never costed) |

---

## 13. Helm / Value Ledger / Posture (ROI)
*Backing: Posture API (`/posture/value`, `/operations`, `/truth-health`, `/governance`), Value Ledger. Bridge ID citations + attribution tier mandatory on every value number.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Workflow | D | attribution |
| Value category | D | Outcome / Work Product / Internal Process / Hybrid / No-ROI |
| Attribution tier | D | A / B / C / D / E (visible within one click) |
| Period | D (time) | window |
| Net AI Workforce ROI | M | headline (Hero ROI) |
| Attributed value (All-Tiers) | M | composite |
| Value by tier (A, A+B, …) | M | tier-decomposed |
| Platform cost | M | GE×rate + TP + license alloc |
| Value per outcome (V) | M | from Value Model Template |
| Outcomes counted (H) | M | terminal wins |
| Escalation overhead (E_n) | M | HTL cost, subtracted |
| Train Me correction cost (C_n) | M | subtracted |
| Incidents avoided value (I_n) | M | Council BLOCK × risk config |
| TTL re-attestation value (A_n) | M | preserved-integrity value |
| Attribution confidence factor (α) | M | 0.0–1.0 discount |
| Top Exposures | M | Helm exposures ranking |
| Posture endpoints (6) status | D | dashboard-first surface |

---

## 14. Connectors & Data Studio Pipeline Health
*Backing: connectors, DIAN, entity resolution, sync jobs.*

| Data point | D/M | Backing / notes |
|---|---|---|
| Connector / source system | D | Salesforce, HubSpot, ERP, … |
| Connector category | D | CRM / DMS / ERP / comms |
| Entity type | D | resolution is type-agnostic |
| Field / PII class | D | normalized field, sensitivity |
| Records ingested | M | by connector |
| Normalization volume | M | fields normalized (free) |
| Entities resolved | M | resolution output |
| Connector health / uptime | M | live status |
| Last sync time | M (time) | freshness |
| Sync failures / errors | M | reliability |
| Refresh cadence adherence | M | scheduled vs actual |

*External connector fields themselves (e.g., every Salesforce object/field the tenant pulls) are also widget-able — those are enumerated per-connector at integration time, not here.*

---

## 15. Cross-cutting computed & comparison data points
*These apply to any measure above — the widget-builder should offer them as transforms, not separate sources. (Comparison indicators are already a shipped pattern — CT-3420.)*

| Transform | Type | Notes |
|---|---|---|
| Period-over-period delta (Δ) | M | vs prior period |
| % change / trend indicator | M | up/down arrow on KPI Widget |
| Sparkline / time series | series | the optional-trend prop |
| Target / threshold | D | goal line; breach highlight |
| Rate (X per Y) | M | normalize any count by time/volume |
| Ratio / mix (% of total) | M | composition |
| Min / max / avg / median / p95 | M | distribution over any measure |
| Top-N / bottom-N | D | ranking (e.g., Top Exposures, worst SLA) |
| Cumulative / running total | M | to-date |
| Forecast / projection | M | runway, SLA-at-risk |
| Freshness flag | D | fresh / approaching-TTL / stale (from source) |
| Scope rollup level | D | Me → Team → Tenant → Org |

---

## How to use this inventory

The domains map 1:1 to the system "data sources" in the widget registry; the rows are the fields each source's aggregation endpoint exposes. Dimensions become endpoint filter params; measures become `body` fields, one per single-number tile. The §15 transforms are applied client-side or as endpoint params, not as new sources. Availability/sequencing for each lives in the v2 catalog's endpoint-status column.
