# AIMS OS Widgets — Development Backlog (from Mike's data-point specs)

Synthesized from three spec docs: **Internal Data-Point Catalog v2** (endpoint mapping + build status), **Widget Data-Point Master Inventory** (the full field universe), and **Widget Field Specifications** (per-tile slot→field bindings). Mapped to our **Composable Dashboards** React/Vite prototype.

> Scope note: the specs describe the *real platform* (endpoints, PBAC, tables). Our prototype mocks data, so for us "ship one aggregation endpoint per source" = "register the source + its D/M fields in our mock registry." The UI/UX work (field model, tile types, builder binding, guardrail labeling, seeded catalog) is what we own here.

---

## The model shift the docs introduce (this is the core)

1. **Every field is a Dimension (D) or a Measure (M).** D = categorical/time (group-by, filter, axis). M = numeric (count/sum/avg/rate/p95). **A widget = one or more Measures sliced by Dimensions**, optionally scoped to a UCP entity. → Our builder currently picks ONE "metric" + a type. This must become measure(s) × dimension(s).
2. **Four field source types:** **S** raw source field · **M** endpoint measure · **F** formula field from a user-authored Table Definition · **T** transform (Δ, % of total, top-N, rate, freshness flag…). The **F path is Mike's "build a table with formulas, then display it."**
3. **Tiles are slots filled by fields.** Each tile type has fixed slots (KPI: value/label/trend/target; Bar: category/value/series; Gauge: value/target/thresholds; Table: columns; Donut: segment/value; Funnel: stage/value; Board: entity/status; Feed; Alerts; Stat row; Leaderboard). The builder binds fields → slots.
4. **Internal AIMS domains are first-class data sources**, registered in the *same* registry as external connectors (so the creation flow is identical whether charting Salesforce or Council outcomes).
5. **Five cross-cutting guardrails**, enforced once at source registration: PBAC scope-binding · Truth-vs-Sandbox labeling · unified credit pool (never the GE-COMM/FIN/COMP split) · Environment dimension (prod/sandbox/dev) · Bridge ID citations on governance/value.
6. **BLOCKED (not buildable now):** token usage, workflow-level latency/token rollup, auth-decision counts — pending the observability backlog. Show as "pending instrumentation," never as live tiles.
7. **Term collision:** dashboard "KPI Widget / Metric Tile" ≠ the embeddable **webchat Widget** (HTL product). Keep distinct in copy.

---

## Development backlog (phased, mapped to the prototype)

Legend: **EXISTS** (we have it) · **UPGRADE** (extend ours) · **NEW** · **BLOCKED** (per docs).

### Phase 1 — Field & tile model (foundational; unblocks the rest) — ✅ DONE (commit `b6cd19a`)
> `src/data/fields.js` + builder rework: Measure × Dimension → tile Slots, with Transforms. Additive/back-compat. Note: aggregation (avg/p95) is a light label; rate(X/Y)/forecast/freshness-flag transforms deferred.
- **1.1 [UPGRADE]** Type every source field as **Dimension or Measure** (`role: 'dimension'|'measure'`; we already have an approximate `kind`). Dimensions become filters/axes/group-by; measures become tile values.
- **1.2 [NEW]** **Slot model per tile type** — declare the slots each tile needs and let the builder bind a field to each slot (KPI value/label/trend/target, Bar category/value/series, Gauge value/target/thresholds, Table columns[], Donut segment/value, Funnel stage/value, Board entity/status, Feed, Alerts, Stat row, Leaderboard).
- **1.3 [UPGRADE]** **Builder flow → measure(s) × dimension(s) → slots** (instead of single-metric → type). Pick a measure, slice by a dimension, choose tile; recommended tile from the measure/dimension shape (we already recommend a type).
- **1.4 [PARTIAL→UPGRADE]** **Transforms (T)** as builder options: Δ/trend ✅, target/threshold ✅ (our goals/format), + add **% of total, rate (X/Y), top-N/bottom-N, min/max/avg/p95, cumulative, forecast, freshness flag, period & scope rollup**.

### Phase 2 — Internal AIMS sources (the V1 "our stuff", to the full domain set)
- **2.1 [UPGRADE]** Expand AIMS sources from the current 2 → the **10+ internal domains** with their D/M fields:
  Agentic Workflow Execution · Actions/Tools Catalog · Council & Governance Gates · Truth Plane/Knowledge Base · Sandbox/DIAN Claims · Drives & Documents · Table Definitions · HTL/Comms Hub · Conversations & Messages · UCP/Entity · Agents & Workforce (AMP) · Credits & Billing · Helm/Value Ledger (ROI) · Connectors/Data-Studio health.
- **2.2 [NEW]** Mark **BLOCKED measures** (token usage, workflow-level rollup, auth-decision counts) as "Pending instrumentation" — visible but disabled in the picker (honest, matches canon).

### Phase 3 — Tile types (cover the spec's vocabulary)
Have: KPI, Line, Bar, Gauge, Table, List, Map, Heat Map, Scatter, Pie(builder), AI Summary, Carousel.
- **3.1 [NEW]** **Donut/Pie** (dashboard render), **Stacked bar/area**, **Funnel**, **Stat row** (repeated label/value/Δ), **Leaderboard** (ranked list w/ rank+sublabel).
- **3.2 [NEW]** **Board** (entity → status columns; agent/employee/node states), **Feed** (timestamp/type/summary/actor), **Alerts** (severity/message/timestamp + **acknowledge** action), **Composite** (full-screen ops board: queue + SLA gauges + agent states).

### Phase 4 — Seed the AIMS widget catalog (from the Field Specs)
- **4.1 [NEW]** Seed representative named widgets per domain (the W-EXEC / W-GOV / W-TRUTH / W-HTL / W-UCP / W-BILL / W-HELM / W-CONV / W-AGENT / W-CONN / W-DIAN / W-DRIVE / W-TABLE catalog) so the Library is rich with AIMS tiles out of the box, each with a sensible default size + tile type.

### Phase 5 — Governance & guardrail UI (cross-cutting) — ✅ DONE (commit `e38e97c`)
> Shipped in `src/data/governance.js` + surfaced across cards, builder, tiles, controls, drill-down. Seeded `d-aims-ops` "AIMS Operations" dashboard showcases every guardrail out of the box.
- **5.1 [NEW]** **Truth vs Sandbox** label/badge on widgets; never blend in one number.
- **5.2 [NEW]** **Environment dimension** (prod/sandbox/dev) on consumption tiles; cost views default to prod.
- **5.3 [NEW]** **Unified credits only** on billing widgets (expose unified + GE count + TP count; never GE-COMM/FIN/COMP).
- **5.4 [NEW]** **Bridge ID citation** drill-down on governance/value widgets (audit-chain link; attribution tier within one click).
- **5.5 [UPGRADE]** **Scope rollup** (Me / My Team / Selected Teams / All / Central / Tenant) — generalize our per-widget audience into the HTL-style scope selector; PBAC is "endpoint-side" (in our mock, source-side).
- **5.6 [PARTIAL]** **Freshness states** fresh / approaching-TTL / stale + **stale-pause** behavior + re-pin (we have re-pin/schema-drift + freshness badges; add approaching-TTL/stale + a "workflows paused on stale data" tile).
- **5.7 [EXISTS]** Default size + Dashboard Builder registration per tile (we already declare sizes + delegate layout).

### Phase 6 — Formula Table Definitions ("build a table → display it") — ✅ DONE (commits `070be7c` + `e27803d`)
> `src/data/tables.js` (formula engine) + Tables page + the table-as-builder-source path. Worked example "BDC Coaching KPIs" → KPI/Bar/Table from one table, with calculated fields.
- **6.1 [DONE]** **Table Definition primitive**: user-authored table with **literal + formula (F)** columns, governed (scope/owner/TTL/freshness). Bind any column to a tile slot (value/category/column) — no new tile type. This delivers Mike's "pull our tables in" AND the deferred **calculated fields**. Worked example in the spec: "BDC Coaching KPIs" → KPI/Bar/Table/Gauge from one table.

### Phase 7 — Live tiles (real-time)
- **7.1 [NEW]** Simulated **live tiles** (WS-stream feel): queue depth, running-now, live ops board, **Alerts** with acknowledge, recent-activity Feed.

### Cross-cutting (non-feature)
- **C.1 [COPY]** Disambiguate dashboard **"Widget/Tile"** vs the webchat **"Widget"** product across UI copy + internal docs.

---

## Recommended sequence

The docs say "sequence by status — start where endpoints exist/are spec'd (Truth, Data pipeline, HTL, Execution list); defer token/rollup." For our prototype:

1. **Fast win first (low risk, high demo value, reuses today's builder):** **Phase 2.1 + 4.1** — expand the AIMS sources to the full domain set and seed the named widget catalog. Mike immediately sees "our stuff," richly. (No model rework needed; the current single-metric builder still works.)
2. **Then the model upgrade:** **Phase 1** (D/M + slots + measure×dimension binding + transforms) + **Phase 3** (new tile types) — this is the real builder leveling-up.
3. **Then guardrails:** **Phase 5** (Truth/Sandbox, Environment, unified credits, Bridge ID, scope rollup, freshness/stale-pause).
4. **Then the big features:** **Phase 6** (Formula Table Definitions = "build a table → display it" + calculated fields) and **Phase 7** (live tiles).
5. **BLOCKED** token/rollup/auth tiles: park until the observability backlog lands.

---

## Quick wins already in place (align with the specs)
Goals/targets + conditional color (Gauge thresholds, KPI target) ✅ · trend/Δ on KPI ✅ · per-metric semantic units & category labels ✅ · resize + default size ✅ · best-visualization recommendation ✅ · re-pin on schema drift ✅ · audience restriction (→ generalize to scope rollup) ✅ · AIMS OS as a source (2 of ~14 domains) ✅.
