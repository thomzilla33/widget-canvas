import { useState } from 'react'
import {
  Check, Palette, Smartphone, Settings, Link2, Clock, Shield, BarChart3,
  Minimize2, MessageSquare, Sparkles, ArrowRightLeft, User, Star,
} from 'lucide-react'
import { PageHeader } from '../components/common/index.jsx'
import { useTheme } from '../state/ThemeContext.jsx'
import HtlWidget from '../components/htl/HtlWidget.jsx'
import { HTL_DEFAULT, HTL_STATES, HTL_CHANNELS, HTL_PLANES, HTL_LANGS } from '../data/htl.js'

const STATE_ICON = { Minimize2, MessageSquare, Sparkles, ArrowRightLeft, User, Clock, Star }

export default function HtlStudio() {
  const { theme } = useTheme()
  const appDark = theme === 'dark'
  const [cfg, setCfg] = useState(HTL_DEFAULT)
  const [state, setState] = useState('idle')
  const [saved, setSaved] = useState(false)

  const set = (k, v) => { setCfg((p) => ({ ...p, [k]: v })); setSaved(false) }
  const setNested = (group, k, v) => { setCfg((p) => ({ ...p, [group]: { ...p[group], [k]: v } })); setSaved(false) }
  const toggleLang = (l) => set('languages', cfg.languages.includes(l) ? cfg.languages.filter((x) => x !== l) : [...cfg.languages, l])

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Human Touch Layer — Widget Studio"
        description="Configure the embeddable AI-to-human widget: brand it, set channels, bind an HTL Pack, and preview every state."
        actions={
          <button
            onClick={() => setSaved(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-aims-blue px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-aims-blue/90"
          >
            {saved ? <><Check size={15} /> Saved</> : 'Save widget'}
          </button>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ── Config panel ── */}
        <div className="space-y-4">
          <Group icon={Palette} title="Identity & brand">
            <Row label="Agent name" req><input className="input" value={cfg.agentName} onChange={(e) => set('agentName', e.target.value)} placeholder="AIMS Assistant" /></Row>
            <Row label="Avatar initials"><input className="input !w-24" maxLength={2} value={cfg.avatarInitials} onChange={(e) => set('avatarInitials', e.target.value.toUpperCase())} /></Row>
            <Row label="Primary color" req><Color value={cfg.primary} onChange={(v) => set('primary', v)} /></Row>
            <Row label="Secondary color"><Color value={cfg.secondary} onChange={(v) => set('secondary', v)} /></Row>
            <Row label="Launcher position" req><Sel value={cfg.launcherPosition} onChange={(v) => set('launcherPosition', v)} opts={[['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left']]} /></Row>
            <Row label="Theme" req><Sel value={cfg.theme} onChange={(v) => set('theme', v)} opts={[['system', 'System'], ['light', 'Light'], ['dark', 'Dark']]} /></Row>
          </Group>

          <Group icon={Smartphone} title="Channels">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {HTL_CHANNELS.map((c) => (
                <Toggle key={c.id} on={!!cfg.channels[c.id]} disabled={c.id === 'text'} onClick={() => setNested('channels', c.id, !cfg.channels[c.id])} label={c.label} hint={c.note} />
              ))}
            </div>
          </Group>

          <Group icon={Settings} title="Behavior & state">
            <Row label="Open trigger" req><Sel value={cfg.trigger} onChange={(v) => set('trigger', v)} opts={[['user_click', 'On click'], ['page_load', 'Page load'], ['time_delay', 'Time delay'], ['scroll_depth', 'Scroll depth'], ['exit_intent', 'Exit intent']]} /></Row>
            <Row label="Default state" req><Sel value={cfg.defaultState} onChange={(v) => set('defaultState', v)} opts={[['minimized', 'Minimized'], ['expanded', 'Expanded'], ['hidden', 'Hidden']]} /></Row>
            <Row label="Persistence" req><Sel value={cfg.persistence} onChange={(v) => set('persistence', v)} opts={[['session', 'Session'], ['cross_session', 'Cross-session']]} /></Row>
            <Row label="Greeting message" req><input className="input" value={cfg.greeting} onChange={(e) => set('greeting', e.target.value)} /></Row>
            <Row label="Pre-chat form"><Toggle on={cfg.preChat} onClick={() => set('preChat', !cfg.preChat)} label="Collect name / email / topic" /></Row>
            <Row label="Post-chat survey"><Sel value={cfg.postSurvey} onChange={(v) => set('postSurvey', v)} opts={[['none', 'None'], ['csat', 'CSAT'], ['nps', 'NPS']]} /></Row>
          </Group>

          <Group icon={Link2} title="HTL Pack binding">
            <Row label="Pack ID" req><code className="text-[12px] text-gray-500 dark:text-slate-400">{cfg.packId}</code></Row>
            <Row label="Pack version" req><Sel value={cfg.packVersion} onChange={(v) => set('packVersion', v)} opts={[['latest', 'Latest'], ['pinned', 'Pinned (v2.3)']]} /></Row>
            <Row label="Transition message" req><input className="input" value={cfg.transitionMsg} onChange={(e) => set('transitionMsg', e.target.value)} /></Row>
            <Row label="Continuation pattern" req><Sel value={cfg.continuation} onChange={(v) => set('continuation', v)} opts={[['handoff', 'Handoff — AI ends'], ['continuation', 'Continuation — AI resumes']]} /></Row>
            <Row label="Show est. wait"><Toggle on={cfg.showWait} onClick={() => set('showWait', !cfg.showWait)} label="Show estimated wait" /></Row>
            <Row label="Show queue position"><Toggle on={cfg.showQueue} onClick={() => set('showQueue', !cfg.showQueue)} label='Show "Position #3"' /></Row>
          </Group>

          <Group icon={Clock} title="Availability">
            <Row label="Active hours"><input className="input" value={cfg.hours} onChange={(e) => set('hours', e.target.value)} /></Row>
            <Row label="Off-hours behavior"><Sel value={cfg.offHours} onChange={(v) => set('offHours', v)} opts={[['self_service_only', 'Self-service only'], ['show_message', 'Capture email'], ['hide_widget', 'Hide widget']]} /></Row>
          </Group>

          <Group icon={Shield} title="Governance & compliance">
            <Row label="Knowledge sources" req>
              <div className="flex flex-wrap gap-1.5">
                {HTL_PLANES.map((p) => (
                  <Chip key={p.id} on={!!cfg.knowledge[p.id]} tone={p.tone} onClick={() => setNested('knowledge', p.id, !cfg.knowledge[p.id])}>{p.label}</Chip>
                ))}
              </div>
            </Row>
            <Row label="Consent banner"><Toggle on={cfg.consent} onClick={() => set('consent', !cfg.consent)} label="Show GDPR consent" /></Row>
            <Row label="Recording"><Sel value={cfg.recording} onChange={(v) => set('recording', v)} opts={[['none', 'None'], ['with_consent', 'With consent'], ['always', 'Always']]} /></Row>
            <Row label="Jurisdiction"><input className="input !w-24" maxLength={2} value={cfg.jurisdiction} onChange={(e) => set('jurisdiction', e.target.value.toUpperCase())} /></Row>
            <Row label="Languages" req>
              <div className="flex flex-wrap gap-1.5">
                {HTL_LANGS.map((l) => <Chip key={l} on={cfg.languages.includes(l)} onClick={() => toggleLang(l)}>{l}</Chip>)}
              </div>
            </Row>
          </Group>

          <Group icon={BarChart3} title="Analytics & audit">
            <p className="text-[12px] text-gray-500 dark:text-slate-400">
              Session ID & Widget ID are issued automatically by ORI; every session event is logged to AMP for filtering and CSAT attribution.
            </p>
          </Group>
        </div>

        {/* ── Live preview ── */}
        <div className="lg:sticky lg:top-0 lg:self-start">
          {/* State switcher */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {HTL_STATES.map((s) => {
              const Icon = STATE_ICON[s.iconName] || MessageSquare
              const on = state === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setState(s.id)}
                  title={s.note}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
                    on ? 'border-aims-blue bg-aims-blue/10 text-aims-blue' : 'border-gray-200 text-gray-500 hover:border-aims-blue/40 dark:border-white/15 dark:text-slate-400'
                  }`}
                >
                  <Icon size={13} /> {s.label}
                </button>
              )
            })}
          </div>

          {/* Browser-frame mock containing the widget */}
          <div className="surface-sunken overflow-hidden rounded-xl">
            <div className="flex items-center gap-1.5 border-b border-gray-200 px-3 py-2 dark:border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 truncate text-[11px] text-gray-400 dark:text-slate-500">app.tenant.com — {HTL_STATES.find((s) => s.id === state)?.note}</span>
            </div>
            <div className={`grid min-h-[580px] place-items-center p-5 ${state === 'launcher' ? 'items-end justify-items-end' : ''}`}
                 style={{ background: appDark ? 'repeating-linear-gradient(45deg,rgba(255,255,255,0.02),rgba(255,255,255,0.02) 12px,transparent 12px,transparent 24px)' : 'repeating-linear-gradient(45deg,#f8fafc,#f8fafc 12px,#f1f5f9 12px,#f1f5f9 24px)' }}>
              <HtlWidget config={cfg} state={state} appDark={appDark} />
            </div>
          </div>

          {/* Governance summary */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {HTL_PLANES.filter((p) => cfg.knowledge[p.id]).map((p) => (
              <span key={p.id} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${p.tone === 'sandbox' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'}`}>{p.id}</span>
            ))}
            <span className="rounded-md bg-gray-500/10 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-slate-300">{cfg.jurisdiction}</span>
            {cfg.languages.map((l) => <span key={l} className="rounded-md bg-gray-500/10 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-slate-300">{l}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Field primitives ──
function Group({ icon: Icon, title, children }) {
  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:border-white/5 dark:text-slate-400">
        <Icon size={14} /> {title}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Row({ label, req, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex shrink-0 items-center gap-1.5 text-[13px] text-gray-700 dark:text-slate-200">
        {label}
        {req && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-400">req</span>}
      </label>
      <div className="flex max-w-[60%] flex-1 justify-end">{children}</div>
    </div>
  )
}

function Sel({ value, onChange, opts }) {
  return (
    <select className="input !w-auto" value={value} onChange={(e) => onChange(e.target.value)}>
      {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

function Color({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-gray-300 dark:border-white/15" aria-label="color" />
      <span className="num text-[12px] text-gray-500 dark:text-slate-400">{value}</span>
    </div>
  )
}

function Toggle({ on, onClick, disabled, label, hint }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={hint}
      aria-pressed={on}
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition-colors ${
        on ? 'border-aims-blue/50 bg-aims-blue/5' : 'border-gray-200 dark:border-white/15'
      } ${disabled ? 'opacity-60' : 'hover:border-aims-blue/40'}`}
    >
      <span className={`relative h-4 w-7 shrink-0 rounded-full transition-colors ${on ? 'bg-aims-blue' : 'bg-gray-300 dark:bg-white/20'}`}>
        <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? 'left-3.5' : 'left-0.5'}`} />
      </span>
      <span className="truncate text-gray-700 dark:text-slate-200">{label}</span>
    </button>
  )
}

function Chip({ on, tone, onClick, children }) {
  const sandbox = tone === 'sandbox'
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition-colors ${
        on
          ? sandbox ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'border-aims-blue bg-aims-blue/10 text-aims-blue'
          : 'border-gray-200 text-gray-500 hover:border-aims-blue/40 dark:border-white/15 dark:text-slate-400'
      }`}
    >
      {children}
    </button>
  )
}
