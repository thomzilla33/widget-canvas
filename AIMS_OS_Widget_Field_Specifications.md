# AIMS OS — Widget Field Specifications

**Why this exists:** the Widget Library names each widget and its source but stops at "binds." This document specifies, per widget, the **exact fields that appear on the tile**, the **slot** each fills, and the **source type** of each field — including fields that are **formulas computed in a user-authored table**.

---

## 1. The field model

Every widget is a set of typed **slots**. Each slot is filled by one **field**. The slots are fixed by the tile type; the fields are what this document pins down.

### Slots by tile type

| Tile type | Slots |
|---|---|
| KPI | `value`, `label`, `trend` (Δ vs prior), `target` (optional) |
| Stat row | repeated { `label`, `value`, `Δ` } |
| Line / Area | `x` (time), `y` (value), `series` (optional dim) |
| Bar / Column | `category` (dim), `value`, `series` (optional) |
| Donut / Pie | `segment` (dim), `value` |
| Stacked | `x`, `value`, `series` (dim) |
| Gauge | `value`, `target`/`max`, `thresholds` (bands) |
| Table | ordered `columns[]`, `row` entity, `sort`/`filter` fields |
| List / Leaderboard | `rank`, `label`, `value`, `sublabel` (optional) |
| Heatmap | `x` (dim), `y` (dim), `value` (cell intensity) |
| Board | `entity`, `status` (state), `metric` (optional) |
| Feed | `timestamp`, `type`, `summary`, `actor` |
| Alerts | `severity`, `message`, `timestamp`, `acknowledge` (action) |
| Funnel | `stage` (ordered dim), `value` |

### Field source types

| Tag | Source type | Meaning |
|---|---|---|
| **S** | Source field | A raw normalized field — `status`, `channel`, `name`, `freshness_state`, `started_at`. |
| **M** | Measure | An aggregation computed by the source endpoint — count, sum, avg, rate, p95. |
| **F** | Formula field | A **computed column defined in a user-authored Table Definition** (or a Value Model) — an expression over other fields, e.g. `close_rate = appts / calls`. Surfaces on a widget identically to a Measure. |
| **T** | Transform | A derived value applied to an S/M/F field — Δ, % of total, top-N rank, freshness flag, period rollup. |

---

## 2. Formula-table-backed widgets (the "build a table, display it" path)

A **Table Definition** is a governed user-authored table (`stt_data_tables` / `stt_table_fields`) composed on top of already-normalized data. Its fields can be **literal** (typed values) or **formula** (a computed expression). When you display that table as a widget, each formula column is just another field the widget binds to — no special widget type.

**Field flow:**
```
normalized source data
   → user-authored Table Definition (literal + formula columns)
      → governed save (scope, owner, TTL/freshness)
         → widget binds a column to a slot (value / category / column)
            → tile inherits the table's freshness_state and flags stale
```

**Worked example — "BDC Coaching KPIs" table → widgets:**

| Column | Kind | Definition |
|---|---|---|
| `rep_name` | literal (S) | from normalized CRM users |
| `calls` | measure-backed (M) | calls this period |
| `appts` | measure-backed (M) | appointments set |
| `close_rate` | **formula (F)** | `appts / calls` |
| `target_close_rate` | literal | manager-set goal |
| `variance` | **formula (F)** | `close_rate − target_close_rate` |

From that one table the team can render, with no new endpoints:
- **KPI** — `value = avg(close_rate)` [F], `target = target_close_rate`, `trend = Δ close_rate` [T]
- **Bar** — `category = rep_name` [S], `value = close_rate` [F], sorted desc (leaderboard)
- **Table** — `columns = [rep_name, calls, appts, close_rate, target_close_rate, variance]`
- **Gauge** — `value = close_rate` [F], `target = target_close_rate`, thresholds at variance bands

**Rules that hold for every formula-backed widget:**
- The formula lives in the table, not the widget — change it once, every bound widget updates.
- The widget inherits the table's `freshness_state`; a stale table flags every tile reading it (default pause behavior).
- Scope/ownership of the table governs who can see the widget's data (PBAC inherited).
- Generality: **any KPI / Bar / Donut / Table / Gauge widget below can swap a built-in Measure (M) for a Formula field (F)** from a Table Definition. Widgets marked **⨍** are the most natural formula targets, but the capability is universal.

---

## 3. Per-widget field specifications

Format per row: each slot written as `slot = field [type]`. `⨍` = strong formula-table candidate.

### A. Agentic Workflow & Execution
| ID | Type | Fields |
|---|---|---|
| W-EXEC-01 | KPI | value = run count [M]; label = "Workflow Runs"; trend = Δ runs [T] |
| W-EXEC-02 | Gauge | value = success rate [M]; target = SLA target [S]; thresholds = [90,95] |
| W-EXEC-03 | KPI | value = error rate [M]; trend = Δ [T] |
| W-EXEC-04 | Area | x = day [S]; y = runs [M]; series = status [S] |
| W-EXEC-05 | Donut | segment = status [S]; value = run count [M] |
| W-EXEC-06 | Bar | category = workflow_name [S]; value = runs [M]; top-N [T] |
| W-EXEC-07 | KPI | value = avg latency [M]; sublabel = p95 [M]; trend = Δ [T] |
| W-EXEC-08 | Heatmap | x = latency bucket [T]; y = workflow [S]; value = count [M] |
| W-EXEC-09 | KPI | value = count(status=RUNNING) [M] (live) |
| W-EXEC-10 | Table | columns = [run_uuid, status, started_at, duration, invoked_by_type, view-trace] [S/M] |
| W-EXEC-11 | List | label = run_uuid [S]; value = elapsed [M]; filter = status=RUNNING & age>threshold [T] |
| W-EXEC-12 | KPI | value = escalation rate [M]; trend = Δ [T] |
| W-EXEC-13 | Bar | category = confidence band [T]; value = count [M] |
| W-EXEC-14 | Bar | category = tool_name [S]; value = call count [M] |
| W-EXEC-15 | Stacked | x = day [S]; value = node executions [M]; series = node_type [S] |
| W-EXEC-16 | Board | entity = node_id [S]; status = node health [S] |
| W-EXEC-17 | KPI | value = retry rate [M] |

### B. Actions, Tools & Catalog
| ID | Type | Fields |
|---|---|---|
| W-ACT-01 | KPI | value = count(stt_actions) [M] |
| W-ACT-02 | KPI | value = count(action_instances) [M] |
| W-ACT-03 | Heatmap | x = agent [S]; y = action [S]; value = assignment [M] |
| W-ACT-04 | Bar | category = tool_name [S]; value = executions [M]; top-N [T] |
| W-ACT-05 | Line | x = day [S]; y = executions [M] |
| W-ACT-06 | KPI | value = snapshot count [M] |

### C. Council & Governance
| ID | Type | Fields |
|---|---|---|
| W-GOV-01 | Donut | segment = Council outcome [S]; value = count [M] |
| W-GOV-02 | KPI | value = total GE [M]; trend = Δ [T] |
| W-GOV-03 | KPI | value = BLOCK count [M]; trend = Δ [T] |
| W-GOV-04 | Stacked | x = day [S]; value = count [M]; series = outcome [S] |
| W-GOV-05 | Bar | category = policy_rule [S]; value = fires [M]; top-N [T] |
| W-GOV-06 | Bar | category = workflow [S]; value = escalations [M] |
| W-GOV-07 | Alerts | severity = kill-switch [S]; message; timestamp [S]; acknowledge |
| W-GOV-08 | KPI | value = grounding-fail flags [M]; trend = Δ [T] |
| W-GOV-09 | KPI | value = low-confidence escalations [M] |

### D. Truth Plane / Knowledge Base
| ID | Type | Fields |
|---|---|---|
| W-TRUTH-01 | KPI | value = active fact count [M] |
| W-TRUTH-02 | KPI | value = TP count [M]; trend = Δ [T] |
| W-TRUTH-03 | Donut | segment = truth_tier [S]; value = count [M] |
| W-TRUTH-04 | Donut | segment = scope [S]; value = count [M] |
| W-TRUTH-05 | KPI+List | value = count(approaching TTL) [M]; list rows = fact_id, expires_at [S] |
| W-TRUTH-06 | Alerts | severity = expired [S]; message = fact_id; timestamp = expired_at [S] |
| W-TRUTH-07 | Line | x = day [S]; y = attestation events [M] |
| W-TRUTH-08 | KPI | value = Train Me corrections [M]; trend = Δ [T] |
| W-TRUTH-09 | KPI | value = candidate facts pending [M] |
| W-TRUTH-10 | Stat row | open CRs [M]; approved CRs [M] |
| W-TRUTH-11 | Line | x = day [S]; y = TR retrievals [M] |
| W-TRUTH-12 | Composite | promotion mix (donut) + package list (table: fact_id, tier, scope, status) [S/M] |

### E. Sandbox / DIAN
| ID | Type | Fields |
|---|---|---|
| W-DIAN-01 | KPI | value = candidate claims [M]; trend = Δ [T] |
| W-DIAN-02 | KPI | value = claims pending review [M] |
| W-DIAN-03 | Donut | segment = claim_type [S]; value = count [M] |
| W-DIAN-04 | Gauge | value = promoted/generated [M ⨍]; target [S] |
| W-DIAN-05 | Funnel | stage = DIAN stage [S]; value = claim count [M] |
| W-DIAN-06 | KPI | value = rejected/conflicted [M] |

### F. Drives & Documents
| ID | Type | Fields |
|---|---|---|
| W-DRIVE-01 | Donut | segment = scope (USER/MANAGE) [S]; value = drive count [M] |
| W-DRIVE-02 | KPI | value = document count [M] |
| W-DRIVE-03 | KPI | value = total size [M] |
| W-DRIVE-04 | Stat row | Files [M]; In Dian [M]; In Sandbox [M]; Associated Claims [M] |
| W-DRIVE-05 | Line | x = day [S]; y = documents added [M] |
| W-DRIVE-06 | Donut | segment = file_type [S]; value = count [M] |
| W-DRIVE-07 | Gauge | value = avg extraction confidence [M] |
| W-DRIVE-08 | Bar | category = drive category [S]; value = count [M] |
| W-DRIVE-09 | KPI | value = workflows with complete drive [M ⨍] |
| W-DRIVE-10 | List | label = document name [S]; value = last-updated age [T] |

### G. Table Definitions
| ID | Type | Fields |
|---|---|---|
| W-TABLE-01 | KPI | value = table count [M] |
| W-TABLE-02 | Donut | segment = freshness_state [S]; value = count [M] |
| W-TABLE-03 | Alerts | severity = stale [S]; message = table name [S]; list |
| W-TABLE-04 | KPI+List | value = overdue refresh tasks [M]; list = table, owner, due [S] |
| W-TABLE-05 | KPI | value = workflows paused on stale data [M] (live) |
| W-TABLE-06 | Bar | category = table [S]; value = consumers bound [M] |
| W-TABLE-07 ⨍ | Table | columns = [all selected fields of the chosen Table Definition] [S/F] |
| W-TABLE-08 ⨍ | KPI | value = any single column of a Table Definition [F]; label = column name; target/trend optional |

### H. Human-Touch Layer
| ID | Type | Fields |
|---|---|---|
| W-HTL-01 | KPI | value = queue depth [M] (live) |
| W-HTL-02 | Gauge | value = SLA compliance rate [M]; target = SLA target [S]; thresholds = [80,100] |
| W-HTL-03 | Stat row | at-risk [M]; breaching [M]; breached [M] (live) |
| W-HTL-04 | KPI | value = MTTR [M]; trend = Δ [T] |
| W-HTL-05 | Donut | segment = status [S]; value = count [M] |
| W-HTL-06 | Line | x = day [S]; y = tickets [M] |
| W-HTL-07 | Bar | category = breach reason [S]; value = count [M] |
| W-HTL-08 | Bar | category = employee [S]; value = breaches [M] |
| W-HTL-09 | Heatmap | x = hour [S]; y = employee [S]; value = tickets [M] |
| W-HTL-10 | Board | entity = employee [S]; status = state (Available/Busy/Away/Offline) [S] (live) |
| W-HTL-11 | Donut | segment = handoff destination [S]; value = count [M] |
| W-HTL-12 | Donut | segment = channel [S]; value = count [M] |
| W-HTL-13 | KPI/Alerts | value = vulnerable-customer escalations [M]; severity (live) |
| W-HTL-14 | Feed | timestamp [S]; type [S]; summary [S]; actor [S] (live) |
| W-HTL-15 | Alerts | severity [S]; message [S]; timestamp [S]; acknowledge |
| W-HTL-16 | Gauge | value = forecasted SLA risk [M ⨍]; thresholds |
| W-HTL-17 | Table | columns = [employee, tickets, MTTR, SLA%, quality score, coaching notes] [S/M/F] |
| W-HTL-18 | Table | columns = [the 12 SLA timers] [M] |
| W-HTL-19 | Composite | full-screen ops board (queue, SLA gauges, agent states) (live) |
| W-HTL-20 | Board | entity = employee [S]; status = working/scheduled/covering [S] (live) |

### I. Conversations & Messages
| ID | Type | Fields |
|---|---|---|
| W-CONV-01 | KPI | value = conversation count [M]; trend = Δ [T] |
| W-CONV-02 | KPI | value = count(status=ACTIVE) [M] (live) |
| W-CONV-03 | Line | x = day [S]; y = message count [M] |
| W-CONV-04 | Donut | segment = participant_role (agent/human) [S]; value = messages [M] |
| W-CONV-05 | KPI | value = avg response time [M ⨍]; trend = Δ [T] |
| W-CONV-06 | KPI | value = citations attached (ref_kind=SOURCE) [M] |
| W-CONV-07 | Bar | category = feature_type [S]; value = count [M] |
| W-CONV-08 | KPI | value = HITL events [M]; trend = Δ [T] |

### J. UCP / Entity & Customer Objects
| ID | Type | Fields |
|---|---|---|
| W-UCP-01 | Gauge | value = profile completeness [M ⨍] (per entity) |
| W-UCP-02 | Bar | category = entity_type [S]; value = count [M] |
| W-UCP-03 | Feed | timestamp [S]; type = activity type [S]; summary [S] (per entity) |
| W-UCP-04 | List | label = opportunity [S]; sublabel = timeline [S] |
| W-UCP-05 | KPI | value = last_interaction recency [M] |
| W-UCP-06 | List | label = asset/vehicle [S]; sublabel = detail [S] |
| W-UCP-07 | KPI/Calendar | value = appointment count [M]; dim = scheduled/past [S] |
| W-UCP-08 | Stat row | open ROs [M]; closed ROs [M] |
| W-UCP-09 | KPI+List | value = open/overdue tasks [M]; list = task, status, due [S] |
| W-UCP-10 | KPI | value = unified entities [M]; sublabel = source records [M] |
| W-UCP-11 | KPI | value = identity merges [M]; trend = Δ [T] |

### K. Agents & Workforce
| ID | Type | Fields |
|---|---|---|
| W-AGENT-01 | KPI | value = active agents [M] |
| W-AGENT-02 | Donut | segment = agent_class [S]; value = count [M] |
| W-AGENT-03 | List | rank; label = agent name [S]; value = run count [M] |
| W-AGENT-04 | Bar | category = agent [S]; value = escalations [M] |
| W-AGENT-05 | KPI | value = NBA actions [M]; trend = Δ [T] |
| W-AGENT-06 | KPI | value = NBA suppressions [M] |
| W-AGENT-07 | Composite | tasks done [M]; customers engaged [M]; open loops [M] (Manager-PA rollup) |
| W-AGENT-08 | Board | entity = agent [S]; status = active/paused [S] (live) |

### L. Credits & Billing
| ID | Type | Fields |
|---|---|---|
| W-BILL-01 | KPI | value = credits consumed (unified) [M]; trend = Δ [T] |
| W-BILL-02 | Gauge | value = balance remaining [M]; max = allocation [S] |
| W-BILL-03 | KPI | value = projected burn [M ⨍]; sublabel = runway days [F] |
| W-BILL-04 | Bar | category = action burn tier [S]; value = credits [M] |
| W-BILL-05 | Donut | segment = GE vs TP [S]; value = count [M] |
| W-BILL-06 | Area | x = day [S]; y = credits [M] |
| W-BILL-07 | KPI/Alerts | value = overage credits [M]; severity |
| W-BILL-08 | Bar | category = workflow [S]; value = cost [M]; top-N [T] |
| W-BILL-09 | Gauge | value = used/allocation [M ⨍]; target = plan limit [S] |
| W-BILL-10 | KPI | value = token usage [M] — *pending instrumentation* |

### M. Helm / Value Ledger
| ID | Type | Fields |
|---|---|---|
| W-HELM-01 | KPI (Hero) | value = Net ROI (All-Tiers) [F]; trend = Δ [T]; citation = Bridge ID |
| W-HELM-02 | Stacked | x = period [S]; value = attributed value [F]; series = attribution_tier [S] |
| W-HELM-03 | Stat row | platform cost [M]; attributed value [F] |
| W-HELM-04 | KPI | value = value per outcome (V) [F] |
| W-HELM-05 | List | rank; label = exposure [S]; value = exposure size [M] |
| W-HELM-06 | KPI | value = escalation overhead E_n [M] |
| W-HELM-07 | KPI | value = incidents avoided I_n [F] |
| W-HELM-08 | Bar | category = workflow [S]; value = ROI [F]; top/bottom-N [T] |
| W-HELM-09 | Donut | segment = value_category [S]; value = ROI [F] |
| W-HELM-10 | Board | entity = posture endpoint [S]; status = health [S] |

*Helm values are formula-derived (Value Model) and must carry attribution_tier + Bridge ID per slot.*

### N. Connectors & Data Studio
| ID | Type | Fields |
|---|---|---|
| W-CONN-01 | Board | entity = connector [S]; status = health [S] (live) |
| W-CONN-02 | KPI | value = records ingested [M]; trend = Δ [T] |
| W-CONN-03 | Stat row | per connector: last_sync_at [S] (live) |
| W-CONN-04 | KPI/Alerts | value = sync failures [M]; severity (live) |
| W-CONN-05 | KPI | value = entities resolved [M] |
| W-CONN-06 | Line | x = day [S]; y = normalization volume [M] |
| W-CONN-07 | Gauge | value = cadence adherence [M ⨍] |

### O. External connector widgets
Built per integration. Each external field maps to a slot exactly as above: a Salesforce numeric field → KPI `value` [S]; a categorical field → Bar `category` [S]; a computed Salesforce field or a Table Definition formula over connector data → `value` [F].

---

## 4. Summary for the team

- Read a widget as **slots filled by fields**; this doc gives the fields. The Library gives names/sizes; the Inventory gives the field universe; this gives the per-tile binding.
- **Three field sources:** raw Source [S], endpoint Measure [M], and **Formula field [F] from a user-authored Table Definition.** Any KPI/Bar/Donut/Table/Gauge can bind to an [F] field — that is the "build a table with formulas, then display it" capability, and it needs no new widget type.
- Formula-backed widgets inherit the table's **freshness_state, scope, and ownership** — governance is automatic.
- `⨍`-marked widgets are the natural formula targets, but the capability is universal across the catalog.
