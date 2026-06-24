# Widget Library & Widget Creation — Engineering Grooming

> **Prototype:** Composable Dashboards — Widget Library + Widget Creation
> **Registered by:** Thomas Gonzalez (Product)
> **Live:** https://thomzilla33.github.io/widget-canvas/widgets
> **Business intent:** Let admins build, browse, govern, and install the reusable widgets ("tiles")
> that fill dashboards and UCPs — reporting on connected sources *and* on AIMS-OS's own activity.
>
> Scope of this doc: **Widget Library + Widget creation only.** Canvas/Dashboard Builder is a
> separate grooming doc.
>
> Each view below = one discussion entry: **what it shows**, **what Engineering should focus on**
> (estimable items), and **evidence** (where to see it live). Everything described is working in the
> prototype (demo data); Engineering's job is to make it real against live services.

---

## V1 — Widget Library (listing)
**Route:** `/widgets` · **Evidence:** library landing + card grid

**What it shows:** The catalog of all widgets (here 81, "78 governed"). A welcome hero ("Build a widget · 2 min", 5 steps, **Create widget** / Skip, "You've built N widgets"), a toolbar (search, **Category** filter, **Type** filter, **All filters**, sort field + direction), and a responsive 3-col grid of widget cards.

**Each card shows:** icon, name, source, status badge (Active / Needs review), `⋯` menu, viz-type chip (KPI/Chart/Donut/Board…), Truth vs Sandbox plane badge, a **live mini-render of the tile**, "Used on N dashboards", and a freshness dot (live).

**Engineering focus**
- [ ] Catalog fetch + pagination/virtualization for large libraries (81 here; design for thousands).
- [ ] Search (debounced) + Category filter + Type filter + sort (field + asc/desc) — server-side or indexed.
- [ ] `All filters` advanced panel (governed/freshness/owner/source) — confirm full filter set.
- [ ] Card mini-render must reuse the SAME render path as the placed tile (preview == placed).
- [ ] Status, plane (Truth/Sandbox), freshness, and "used on N dashboards" are live-derived, not static.
- [ ] `⋯` per-card menu actions (Edit / Delete / Duplicate?) + permissions.
- [ ] Empty state + "no results" state.

---

## V2 — Templates from connected sources _(deferred — not in V1)_
> Skipped for V1. Source template bundles are a V2 feature once the source marketplace is stable.

---

## V3 — Needs attention (governance / health)
**Route:** `/widgets` (section) · **Evidence:** "Needs attention" with flagged widgets

**What it shows:** A section below the main grid that surfaces widgets that broke or drifted. Example flagged cards: *NPS Trend* — "Stale / outdated · 2 fields changed in Survey Data View" → **Remap widget** CTA; *Open Tickets* — "Wrong records shown". Flag attribution visible: "Flagged by Dana Lee (Support Agent) · 3h ago". A severity count badge on the section header.

**Engineering focus**
- [ ] **Schema drift detection** — when a source field is renamed/removed/retyped, flag any widget that maps to it. Needs a diff between the widget's saved field snapshot and the current source schema.
- [ ] **Remap widget flow** — re-point fields after a schema change (old field → new field picker), save, auto-clears the flag.
- [ ] Severity + count badge on the section header; section collapses when all items are resolved.
- [ ] _(V2)_ User-submitted flag pipeline (who flagged, when, reason text) → stored and surfaced here.

---

## V4 — Widget detail modal
**Route:** `/widgets` → click a card · **Evidence:** detail modal (e.g. "AI Resolved vs Handoff")

**What it shows:** Card click opens a detail modal (NOT the builder): name + source, viz-type + plane + freshness badge, a **live preview with Small / Medium / Large** size switch, **About** + **Best for** copy, "Used on N dashboards", and actions **Delete · Edit · Close · Add to a dashboard**.

**Engineering focus**
- [ ] Size switch re-renders the real tile at sm/md/lg (matches placement sizes on the canvas).
- [ ] **Add to a dashboard** → placement flow (pick dashboard/tab → place tile).
- [ ] **Edit** opens the builder pre-filled with the widget's current config.
- [ ] **Delete** = staged confirm + cascade (remove from dashboards) — gate by permissions; system widgets are protected.
- [ ] About / Best-for copy managed per widget type (seeded, editable by admin).

---

## V5 — Widget Builder · Describe-it (NL → config) _(deferred — not in V1)_
> Skipped for V1. NL-to-config is a differentiating AI feature but adds significant complexity (model call, source intent mapping, guardrails). The manual builder (V6–V9) ships first; Describe-it is V2 once the manual flow is stable.

---

## V6 — Widget Builder · Data source (step 1)
**Route:** `/widgets/new` · **Evidence:** "Data source" picker

**What it shows:** Search over connected sources + a list grouped by category (AIMS OS sources first, each "Connected"). Selecting a source collapses it to the chosen one with a "Change" affordance.

**Engineering focus**
- [ ] Connected-source list pulled from Data Studio (status: connected / syncing / error).
- [ ] AIMS OS sources surfaced first (Agentic Studio, HTL, Governance, etc.).
- [ ] Selected-source collapse + Change affordance.
- [ ] **Pull mapped tables, not just aggregate metrics** (Mike's ask) — tables surface in V7 as Record sets.
- [ ] _(V2)_ "Browse all sources" marketplace (full catalog + connect flow) — confirm scope boundary with Data Studio.

---

## V7 — Widget Builder · Measure (step 2)
**Route:** `/widgets/new` · **Evidence:** "Measure" — metrics + record sets

**What it shows:** For the chosen source, a list of **metrics** (e.g. Escalation Rate, Auto-Resolution Rate, Actions by Type, Outreach Attempts, Tickets Pushed to CRM) each with a **recommended widget type** badge (Rec: Gauge / Bar / Line / KPI), and a **Record sets** group (Agentic Workflows · 48 rows, Human-in-the-Loop Queue · 1,240 rows, Conversations · 86,400 rows) each "Rec: List/Table".

**Engineering focus**
- [ ] Metric catalog per source (name, kind, recommended widget type).
- [ ] **Record sets** = row-level mapped tables → rendered as Table/List widget type.
- [ ] Recommended-type logic per metric kind — drives the pre-selected type in the gallery (V8).
- [ ] Live preview panel reads real values for the selected measure as soon as a metric is picked.

---

## V8 — Widget Builder · Slice by (step 3)
**Route:** `/widgets/new` · **Evidence:** "Slice by" (dimension) section

**What it shows:** After a measure is chosen, "Slice by" offers the applicable dimensions for that source × measure (e.g. by team, region, stage) plus basic aggregation (sum / avg / count / rate). Before a measure is picked it reads "Pick a measure first to choose how to slice it."

**Engineering focus**
- [ ] Applicable dimensions per (source, measure) — scoped list, not a global dimension picker.
- [ ] Aggregation options (sum / avg / count / rate) and how each re-scopes the computed value.
- [ ] Slicing re-labels the breakdown in the live preview and recomputes shares (Σ = 100%).
- [ ] Rate metrics are re-scoped by filters, not added (additive vs rate distinction).

---

## V9 — Widget Builder · Widget type gallery (step 4)
**Route:** `/widgets/new` · **Evidence:** "Widget type" tile gallery

**What it shows:** A gallery of viz types (KPI, Stat Row, Gauge, Line, Bar, Donut, Funnel, Table, List, Heat Map, Scatter, Board, Feed, Alerts, AI Summary, Map + Consumption types) with the **recommended** type marked and poor-fit types dimmed for the chosen metric.

**Engineering focus**
- [ ] Type registry + per-type renderer (charts on **Highcharts** — confirm licensing before production).
- [ ] Fit scoring: mark recommended type, grey out poor fits based on metric kind (e.g. a single KPI can't be a Funnel).
- [ ] Switching type re-visualizes the SAME data — no swap to unrelated demo rows.

---

## V10 — Widget Builder · Config, Format, Live preview & Save (step 5)
**Route:** `/widgets/new` · **Evidence:** right-side "Live preview" + "Save to catalog"

**What it shows:** A config panel (name, goal direction + threshold), a format panel (currency / percent / abbreviate / decimals / prefix / suffix), applicable filters, and a **live preview** that updates as every choice changes ("preview == placed"). **Save to catalog** persists the widget; **Cancel** discards.

**Engineering focus**
- [ ] Config: name (required), goal direction (↑ good / ↓ good) + threshold → drives RAG badge on the tile.
- [ ] Format options applied live in the preview (currency symbol, abbreviation, decimal places, prefix/suffix).
- [ ] Live preview shares the exact placed-tile render path — no separate preview renderer.
- [ ] Save persists to catalog with governed metadata: source, plane (Truth/Sandbox), freshness, owner. Required fields validated before Save is enabled.
- [ ] Freshness selection (realtime / 15m / 1h / 24h) → drives the live dot + tick interval on placed tiles.
- [ ] Cancel discards without saving; confirm prompt if user has made changes.

---

### Out of scope — V1 (separate grooming docs or deferred)
- **V2 — Source templates**: deferred to V2, depends on source marketplace.
- **V5 — Describe-it / NL composer**: deferred to V2, manual builder ships first.
- **V3 flag pipeline** (user-submitted flags): V2; schema drift detection only in V1.
- Canvas / Dashboard Builder (placement, free-grid, zones, publish).
- UCP entity dashboards + the docked Concierge.
- Source connection / Data Studio.
