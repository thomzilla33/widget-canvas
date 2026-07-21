import { useState } from 'react'
import { ExternalLink, RefreshCw, Calendar, Download } from 'lucide-react'
import { STUDIO_HEALTH } from '../../data/home.js'

// ── Score ring ────────────────────────────────────────────────────────
const R   = 28
const C   = +(2 * Math.PI * R).toFixed(2)   // ≈ 175.93
const ARC = +(C * 0.75).toFixed(2)           // 270° arc ≈ 131.95

function ringColor(score) {
  if (score >= 85) return '#84CC16'
  if (score >= 70) return '#EAB308'
  return '#DC2626'
}

function ScoreRing({ score }) {
  const progress = +((ARC * score) / 100).toFixed(2)
  const color    = ringColor(score)
  const origin   = '35px 35px'
  return (
    <svg viewBox="0 0 70 70" width="64" height="64" className="shrink-0" aria-hidden="true">
      {/* Track */}
      <circle cx="35" cy="35" r={R} fill="none" strokeWidth="5.5"
        stroke="currentColor" className="text-gray-200 dark:text-white/[0.08]"
        strokeDasharray={`${ARC} ${C - ARC}`} strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: origin }}
      />
      {/* Progress */}
      <circle cx="35" cy="35" r={R} fill="none" strokeWidth="5.5"
        stroke={color}
        strokeDasharray={`${progress} ${C - progress}`} strokeLinecap="round"
        style={{ transform: 'rotate(135deg)', transformOrigin: origin }}
      />
      {/* Score label */}
      <text x="35" y="40" textAnchor="middle"
        style={{ fontSize: '17px', fontWeight: 700, fill: color, fontFamily: 'inherit' }}>
        {score}
      </text>
    </svg>
  )
}

// ── Status badge ──────────────────────────────────────────────────────
const STATUS_CLS = {
  healthy:  'bg-green-500/10 text-green-500 border-green-500/20 dark:text-green-400',
  watch:    'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400',
  critical: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400',
}
const STATUS_LABEL = { healthy: 'Healthy', watch: 'Watch', critical: 'Critical' }

// ── CTA icon map ──────────────────────────────────────────────────────
const ICON_MAP = { ExternalLink, RefreshCw, Calendar }

// ── Partition card ────────────────────────────────────────────────────
function PartitionCard({ partition, studioLabel, studioColor, studioShort }) {
  const pos = partition.delta > 0
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 dark:border-white/[0.07] dark:bg-white/[0.02]">
      {/* Badges row */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white"
          style={{ background: studioColor }}
        >
          {studioLabel}
        </span>
        <span className="text-[12px] font-semibold text-gray-800 dark:text-slate-100">
          {partition.name}
        </span>
        <span className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLS[partition.status]}`}>
          {STATUS_LABEL[partition.status]}
        </span>
      </div>

      {/* Score + delta + summary */}
      <div className="flex items-start gap-3">
        <ScoreRing score={partition.score} />
        <div className="min-w-0 pt-0.5">
          <p className={`text-[11px] font-semibold ${pos ? 'text-aims-governed' : 'text-aims-stale'}`}>
            {pos ? '↑' : '↓'} {Math.abs(partition.delta)} pts vs last week
          </p>
          <p className="mt-1 text-[11px] leading-snug text-gray-500 dark:text-slate-400">
            {partition.summary}
          </p>
        </div>
      </div>

      {/* Path to 100% */}
      <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-white/[0.06] dark:bg-black/20">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
            Path to 100%
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">
            Gap to close: {partition.gapPts} pts
          </span>
        </div>
        <p className="mb-2.5 text-[10px] leading-snug text-gray-400 dark:text-slate-500">
          Do these in order and you'll reach 100% health on this partition. Estimated lift: +{partition.gapPts} pts.
        </p>

        <div className="flex flex-col gap-1.5">
          {partition.actions.map((action, idx) => {
            const Icon    = ICON_MAP[action.cta.icon]
            const primary = action.cta.variant === 'primary'
            return (
              <div
                key={action.id}
                className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-2 dark:border-white/[0.05] dark:bg-white/[0.025]"
              >
                {/* Step number */}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-600 dark:bg-white/10 dark:text-slate-400">
                  {idx + 1}
                </span>

                {/* Title + chips */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium text-gray-800 dark:text-slate-200">
                    {action.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    {action.linkedIssue && (
                      <span className="text-[9px] font-semibold text-aims-blue">
                        Linked: {action.linkedIssue}
                      </span>
                    )}
                    <span className="rounded bg-gray-100 px-1 py-px text-[9px] text-gray-500 dark:bg-white/5 dark:text-slate-500">
                      Opens in {studioShort}
                    </span>
                    <span className="rounded bg-green-500/10 px-1 py-px text-[9px] font-semibold text-aims-governed">
                      +{action.lift}%
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className={
                    primary
                      ? 'flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-aims-blue px-2.5 py-1.5 text-[10px] font-semibold text-white hover:brightness-110'
                      : 'flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                  }
                >
                  {Icon && <Icon size={10} aria-hidden="true" />}
                  {action.cta.label}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────
export function StudioHealthCard() {
  const [activeId, setActiveId] = useState('gov')
  const studio = STUDIO_HEALTH.find(s => s.id === activeId)

  return (
    <div className="card flex flex-col">
      {/* Header: studio tabs + export */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-white/[0.06]">
        <div className="flex gap-0.5">
          {STUDIO_HEALTH.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeId === s.id
                  ? 'bg-gray-100 dark:bg-white/10'
                  : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              style={activeId === s.id ? { color: s.color } : {}}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
        >
          <Download size={11} aria-hidden="true" />
          Export report
        </button>
      </div>

      {/* Subtitle */}
      <div className="border-b border-gray-100 px-4 py-2 dark:border-white/[0.04]">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">
          Partition breakdown — click any studio above to switch.
        </p>
      </div>

      {/* Two-column partition grid */}
      <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
        {studio.partitions.map(partition => (
          <PartitionCard
            key={partition.id}
            partition={partition}
            studioLabel={studio.label}
            studioColor={studio.color}
            studioShort={studio.short}
          />
        ))}
      </div>
    </div>
  )
}
