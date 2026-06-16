# Internal AIMS OS Data-Point Catalog — Widget Dashboard (v2, live-canon grounded)

**What changed from v1:** grounded against live Jira/Confluence (capabilities move daily, KB is stale). The dashboard board, tile, and builder already exist; the data-feed endpoint contract is already established; token usage is not yet instrumented; and "Widget" is an overloaded term in the codebase. All four are reflected below.

**Builder model (unchanged):** every field is a **Dimension** (D — categorical/time; group-by, filter, axis) or a **Measure** (M — numeric; count, sum, avg, rate, p95). A widget = one or more measures sliced by dimensions, optionally scoped to a UCP entity.

---

## 0. Live-canon reality — read first

**The infrastructure exists. The net-new work is the data-source binding layer + one aggregation endpoint per source.**

- **Dashboard Builder** (CT-2902, CT-2639, CT-2836 — Done) is the parent feature. It owns widget drag/resize/reposition and **persists layout per user per sandbox**. Every tile registers as a Dashboard Builder widget with a declared **widget type + default size** (small/medium/large grid). Tiles must NOT implement their own layout logic — they delegate to the Builder. If the Builder is unavailable, the surface falls back to a fixed layout.
- **KPI Widget component** (CT-3770, In Dev) is the tile primitive. Props: **metric label, metric value, optional trend indicator.** Embeds inside the Builder's outer container. One single-number tile = one KPI Widget bound to one endpoint field. (Chart/throughput tiles use a separate charting component, per CT-2902.)
- **Already shipped/feeding tiles today:** Drive pipeline-metrics row (Files / In Dian / In Sandbox / Associated Claims — CT-2784), Promotions metrics dashboard (CT-3195), Overview KPI metric cards (CT-2899), Truth Plane / Sandbox / Intelligence Library metric tiles (CT-3787/3789/3785, in progress), "About to Expire" and "Needs Review" cards (CT-3825/3829).

### The endpoint contract (the answer to "understand the endpoints")

The established pattern — shipped in `POST /v1/my-work/totals` (CT-3513, Done) — is a **per-domain aggregation endpoint**, not a raw row query from the widget:

- One backend call returns **all of a surface's card values** as a flat, named body. Example shipped body: `{ totalItems, changeRequests, proposals, claimSuggestions, sources: { knowledgeBases, sandboxes } }`.
- **Each dashboard card maps to exactly one field** in `body`.
- **Standard envelope on every endpoint:** `{ status_code, msg_code, request_id, body, meta? }`.
- Counts are **pre-scoped server-side to what the requesting user can access** (PBAC baked into the endpoint — the widget never filters for permission itself).
- Invariants enforced server-side (e.g. `totalItems == changeRequests + proposals + claimSuggestions`).

The live variant for real-time tiles — comms-hub monitoring (CT-3358) — adds: `GET /v1/workspace/<domain>/monitoring/dashboard` (top metrics) + `…/monitoring/alerts/list` + `…/alerts/{uuid}/acknowledge` + `…/activity/recent` (feed) + `WS /v1/workspace/<domain>/monitoring/streams/dashboard` (JWT-WebSocket, live updates).

**So every internal source below = one `…/totals` or `…/monitoring/dashboard` endpoint in that exact shape, plus an optional WS stream for live tiles.**

### Two corrections

- **Token usage is NOT yet available.** Toolv2 observability (CT-3379, Done) ships OTEL/OTLP traces (timing, retries, cache hits, per-tool spans). But **token-usage tracking from LLM calls, the OTEL→Prometheus bridge, graph-level/workflow-level spans, and permission-decision logging are all explicitly not-yet-implemented future enhancements.** Spans today are per-tool only. → Any **token tile, workflow-level latency/token rollup, or auth-decision tile is BLOCKED pending the observability backlog**, not buildable now.
- **"Widget" is overloaded — brief the team.** The ARP-661…715 / CT-3405…3421 / "Chat Widget V0.5" (ARP-660) series is the **embeddable webchat Widget** (embed code, domain allowlist, widget token, appearance/agent config, RBAC, analytics) — the HTL customer-facing product, NOT dashboard tiles. Dashboard tiles are "KPI Widget / Metric Tile / Dashboard Builder widget." Do not cross-wire these epics.

---

## Cross-cutting rules (every internal source)

- **PBAC+ACL scope-binding** is enforced *in the endpoint*, not the widget. Scope levels mirror HTL: Me / My Team / Selected Teams / All Teams / Central / All Tenants / Specific Tenant.
- **Truth vs Sandbox labeling.** Sandbox-sourced measures are non-authoritative and labeled; never blend with Truth in one number.
- **Credits ≠ tokens.** Credits (GE+TP) are billing; tokens are observability-only and currently un-instrumented (see correction above). Separate tiles, never the same one.
- **Unified credit pool only (tenant-facing).** Expose unified credits, GE count, TP count. Never expose the GE-COMM/FIN/COMP split.
- **Environment dimension** (prod / sandbox / dev) on every consumption tile; cost views default to prod (dev/stage metered, never billed).
- **Bridge ID citations** on governance/value measures for audit-chain drill-down.
- **Dashboard Builder registration:** every internal tile declares widget type + default size and delegates layout to the Builder.

---

## Endpoint mapping — per source (proposed route · build status)

Status legend: **EXISTS** (shipped) · **PARTIAL** (some pieces shipped) · **TO BUILD** (no endpoint yet — per canon, absence treated as confirmation) · **BLOCKED** (dependency not yet implemented).

| # | Source | Proposed totals/monitoring endpoint | Status & canon evidence |
|---|---|---|---|
| 1 | Agentic Workflow Execution | `POST /v1/workspace/agentic/executions/totals` + reuse network-executions list/trace | **PARTIAL** — paginated execution list + step-trace EXISTS (CT-2827, Done; backed by `aik_execution_logs`). Totals/aggregation tile endpoint TO BUILD. Workflow-level latency/token rollups BLOCKED (graph-span work not done). |
| 2 | Action & Governance / Council | `POST /v1/workspace/governance/actions/totals` | **PARTIAL** — action runs logged in `aik_execution_logs`; Toolv2 traces EXIST. Council-outcome aggregation tile TO BUILD. Auth-decision counts BLOCKED (Toolv2 backlog). |
| 3 | Truth Plane / Governance Studio | `POST /v1/workspace/truth/totals` (truths, packs, attestations, approaching-TTL) | **PARTIAL** — Promotions metrics dashboard EXISTS (CT-3195); Truth Plane Detail tiles in progress (CT-3787). Domain counts via metrics service TO BUILD (CT-2658, To Do). |
| 4 | HTL / Comms Hub | `GET /v1/workspace/communication-hub/monitoring/dashboard` (+ alerts, activity, WS stream) | **TO BUILD — fully specified** (CT-3358, To Do). This is the live-tile + alert + WS reference; build HTL tiles on this group. |
| 5 | Credit & Consumption | `POST /v1/workspace/billing/consumption/totals` | **TO BUILD** — GE/TP ChargeRecords exist in the rating engine; no dashboard/totals endpoint in canon. **Token sub-metric BLOCKED** (not instrumented). |
| 6 | Helix Data Studio (connectors/DIAN) | `POST /v1/workspace/data/pipeline/totals` | **PARTIAL** — Drive pipeline-metrics row EXISTS (CT-2784: Files/In Dian/In Sandbox/Associated Claims). Drives/sandboxes domain counts TO BUILD (CT-2658). |
| 7 | Table Definition primitive | `POST /v1/workspace/tables/health/totals` + SQL-Runner for contents | **PARTIAL** — freshness tiles partly exist ("About to Expire" CT-3825, "Needs Review" CT-3829, both buggy/pagination-coupled). Contents-as-source uses SQL Runner over `stt_data_tables`/`stt_table_fields` (EXISTS at data layer). Health-totals endpoint TO BUILD. |
| 8 | UCP / Entity & Conversations | `POST /v1/workspace/ucp/totals` | **PARTIAL** — conversations list API EXISTS (`aik_api_list_conversations`). Totals/aggregation endpoint TO BUILD. |
| 9 | Agent / Workforce (AMP) | `POST /v1/workspace/agents/totals` | **TO BUILD** — Agent Registry exists; no agent-activity totals endpoint in canon. |
| 10 | Helm / Value Ledger (ROI) | Posture API: `/posture/value`, `/operations`, `/truth-health`, `/governance` | **TO BUILD** — Posture endpoints are spec'd in the Helm math spec; platform audit showed zero Jira tickets. Confirm as net-new v1.0 Helm work. |

---

## The ten sources — fields

*(Field lists are the data-point inventory each endpoint's `body` should expose. Dimensions become endpoint filter params; measures become `body` fields, one per tile.)*

### 1. Agentic Workflow Execution — Agentic Studio / AMP
*Backed by `aik_execution_logs` (tenant schema `aut_{tenant_uuid}`), `aik_action_instances`, `stt_actions`/`stt_tools` core catalog, AMP registry.*
- **D:** workflow_id/name, workflow_version, parent/child, node_id/type, agent_id/role, `invoked_by_type` (AGENT/USER/WORKFLOW/TRIGGER/SYSTEM), `status` (RUNNING/SUCCESS/FAILED/CANCELLED), environment, tenant/team, started_at/finished_at.
- **M:** workflow runs, node executions, success/error/escalation rate, avg & p95 latency (`finished_at − started_at`), avg confidence, tool calls. **BLOCKED:** token usage, workflow-level latency rollup (per-tool spans only today).

### 2. Action & Governance — Council / Action Gates
- **D:** action_type, Council outcome (PASS/BLOCK/DEGRADE/ESCALATE), policy_rule_fired, confidence_band, risk_tier, workflow/agent.
- **M:** action gate decisions (= total GE), % by outcome, BLOCK count (incidents-avoided signal → Value Ledger I_n), policy violations flagged, kill-switch events. **BLOCKED:** auth/permission-decision counts.
- *Guardrail: roll up to one GE count; never expose COMM/FIN/COMP.*

### 3. Truth Plane — Helix Governance Studio
- **D:** truth_tier (T0–T3), scope (Local/Org-Group/Global), fact_domain/type, status (active/superseded/expired/retracted), attested_by/source.
- **M:** TP count (truth writes), active facts, approaching-TTL / stale / expired, attestation events, Train Me corrections (→ C_n), candidate facts pending promotion, TR retrievals (free, but usable volume).

### 4. Human-Touch Layer (HTL)
*Build on the comms-hub monitoring group (CT-3358).*
- **D:** pack/version, channel (webchat/SMS/email/voice), handoff_destination (External/AIMS Internal/Lightweight), team/employee, status/priority/customer_tier, escalation_reason, breach_severity.
- **M:** tickets, queue depth, SLA compliance rate, breach count/rate, MTTR, the 12 SLA timers (time-to-assign/acknowledge/first-response/resolution, customer wait, etc.), handoffs fired, macro executions, vulnerable-customer escalations, recording-consent sessions, HTL GE consumed, per-employee scorecard signals. Plus alerts list + recent-activity feed + live WS stream.

### 5. Credit & Consumption — billing observability (tenant-facing)
- **D:** workflow/agent/team, action_type burn tier (simple 1 / standard 3 / financial 5 / compliance 10 / TP T1 2 / TP T2–T3 5–15), environment, period.
- **M:** credits consumed (unified — headline), GE count, TP count, burn rate by action type, overage credits, balance remaining, projected burn. **BLOCKED separate efficiency tile:** token usage.
- *Guardrail: unified pool only; thinking (reasoning/RAG/Sandbox/drafting/normalization) never appears as cost.*

### 6. Helix Data Studio — connectors / DIAN / entity resolution
- **D:** connector/source_system, entity_type, pipeline_stage (DIAN), field/PII_class.
- **M:** records ingested, normalization volume, entities resolved / unified entities, identity merges, connector health/uptime, last sync time, sync failures, candidate facts generated. *(Files / In Dian / In Sandbox / Associated Claims already shipped as the Drive pipeline row.)*

### 7. Table Definition Primitive
*Backed by `stt_data_tables` / `stt_table_fields`.*
- **(a) Health — D:** table/owner, scope (GLOBAL/TENANT/team), view_preset, source_template, freshness_state (fresh/approaching-TTL/stale). **M:** table count, field count, tables stale / approaching TTL, refresh tasks open/overdue, consumers bound, workflows paused on stale data, last_refreshed_at age.
- **(b) Contents-as-source:** any user-authored table is directly chartable via the existing SQL Runner; fields auto-type to D/M by `data_type`; the tile inherits and flags `freshness_state`.

### 8. UCP / Entity & Conversations
*Backed by UCP, `aik_conversations`, `aik_messages`, party summaries.*
- **D:** entity/entity_type, party, conversation_status, participant_role (human/agent), channel.
- **M:** profile completeness, entity count, conversations, messages, active conversations, agent vs human message split, last_message_at.
- *UCP-pinned tiles auto-scope every measure to the entity in context.*

### 9. Agent / Workforce — AMP
- **D:** agent/agent_class (User PA / Manager / Director / Council / NBA / narrow), status (active/paused), capability_scope, registry_version, team/manager.
- **M:** agents registered/active, agent run count, escalations to Council, NBA actions triggered, Manager-PA team rollups (completed tasks, customers engaged, open loops).

### 10. Helm / Value Ledger — ROI
*Posture API + Value Ledger.*
- **D:** workflow, value_category (Outcome/Work Product/Internal Process/Hybrid/No-ROI), attribution_tier (A–E, **visible within one click of any value number**), period.
- **M:** Net AI Workforce ROI, attributed value by tier, platform cost, escalation overhead, correction cost, incidents avoided, TTL re-attestation value. *Every value measure carries Bridge ID citations.*

---

## Build recommendation

1. **Register each internal source as a system "data source"** in the same registry the external connectors use, so the tenant's widget-creation flow is identical whether charting Salesforce fields or Council outcomes.
2. **Ship one aggregation endpoint per source** in the `…/totals` (or `…/monitoring/dashboard` for live) contract — standard envelope, server-side PBAC scoping, one card per body field. Use `POST /v1/my-work/totals` as the copy-pattern.
3. **Enforce the five cross-cutting guardrails once at source registration**, not per widget.
4. **Sequence by status:** start where endpoints already exist or are spec'd — Truth (CT-3195/2658), Data pipeline (CT-2784/2658), HTL (CT-3358), Execution list (CT-2827). Defer token/workflow-rollup tiles until the observability backlog (CT-3379 follow-ups) lands.
5. **Brief the team on the term collision** so dashboard "KPI Widget" work isn't confused with the embeddable webchat "Widget" epics.
