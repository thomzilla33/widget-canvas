import {
  Minimize2, X, Send, Sparkles, User, Clock, Star, ShieldCheck, Mail,
  MessageSquare, Mic, Video, MonitorUp, CreditCard, FileSignature, Users,
} from 'lucide-react'
import { HTL_CHANNELS, HTL_TRANSCRIPT, widgetIsDark } from '../../data/htl.js'

const CH_ICON = { text: MessageSquare, voice: Mic, video: Video, screen: MonitorUp, payment: CreditCard, sign: FileSignature, cobrowse: Users }

// #RRGGBB → rgba()
const rgba = (hex, a) => {
  const n = parseInt(String(hex).replace('#', ''), 16)
  if (Number.isNaN(n)) return `rgba(37,99,235,${a})`
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// The embeddable HTL widget, rendered for a given `state` + branding `config`.
// `appDark` resolves the widget's own theme when set to "system".
export default function HtlWidget({ config, state, appDark = false }) {
  const dark = widgetIsDark(config.theme, appDark)
  const C = {
    surface: dark ? '#0f1629' : '#ffffff',
    border: dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb',
    text: dark ? '#e2e8f0' : '#0f172a',
    sub: dark ? '#94a3b8' : '#64748b',
    clientBubble: dark ? 'rgba(255,255,255,0.08)' : (config.secondary || '#EEF2F7'),
    clientText: dark ? '#e2e8f0' : '#0f172a',
    footer: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
  }
  const primary = config.primary || '#2563EB'
  const fontFamily = config.fontFamily || 'inherit'

  if (state === 'launcher') return <Launcher config={config} primary={primary} />

  const enabledChannels = HTL_CHANNELS.filter((c) => config.channels?.[c.id])

  return (
    <div
      className="flex w-[348px] flex-col overflow-hidden rounded-2xl shadow-2xl"
      style={{ height: 540, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontFamily }}
    >
      <Header config={config} state={state} primary={primary} />

      <div className="flex-1 overflow-hidden" style={{ background: C.surface }}>
        {state === 'idle' && <IdleBody config={config} C={C} />}
        {state === 'ai' && <ChatBody C={C} primary={primary} mode="ai" config={config} />}
        {state === 'handoff' && <HandoffBody config={config} C={C} primary={primary} />}
        {state === 'human' && <ChatBody C={C} primary={primary} mode="human" config={config} />}
        {state === 'offhours' && <OffHoursBody config={config} C={C} primary={primary} />}
        {state === 'survey' && <SurveyBody config={config} C={C} primary={primary} />}
      </div>

      {/* Footer: input + channel strip — hidden on transitional / terminal states. */}
      {(state === 'idle' || state === 'ai' || state === 'human') && (
        <div style={{ borderTop: `1px solid ${C.border}`, background: C.footer }}>
          <div className="flex items-center gap-2 px-3 py-2.5">
            <div
              className="flex flex-1 items-center rounded-full px-3 py-2 text-[13px]"
              style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub }}
            >
              Type your message…
            </div>
            <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style={{ background: primary }} aria-label="Send">
              <Send size={15} />
            </button>
          </div>
          {enabledChannels.length > 1 && (
            <div className="flex items-center gap-1 px-3 pb-2.5">
              {enabledChannels.map((c) => {
                const Icon = CH_ICON[c.id]
                return (
                  <span key={c.id} className="grid h-7 w-7 place-items-center rounded-lg" style={{ color: C.sub, background: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }} title={c.label}>
                    <Icon size={14} />
                  </span>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Launcher({ config, primary }) {
  const left = config.launcherPosition === 'bottom-left'
  return (
    <div className="relative h-full w-full">
      <button
        className="absolute bottom-4 grid h-14 w-14 place-items-center rounded-full text-white shadow-2xl transition-transform hover:scale-105"
        style={{ background: primary, [left ? 'left' : 'right']: 16 }}
        aria-label={`Open ${config.agentName}`}
      >
        <MessageSquare size={24} />
        <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">2</span>
      </button>
    </div>
  )
}

function Avatar({ config, size = 32 }) {
  const primary = config.primary || '#2563EB'
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{ width: size, height: size, background: rgba(primary, 0.9), fontSize: size * 0.4 }}
    >
      {(config.avatarInitials || 'AI').slice(0, 2)}
    </span>
  )
}

function Header({ config, state, primary }) {
  const human = state === 'human'
  const name = human ? 'María González' : config.agentName
  const status = state === 'offhours' ? 'Away' : human ? 'Human specialist' : 'AI · online'
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-3 text-white" style={{ background: primary }}>
      {human ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20 font-semibold">MG</span>
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/20"><Sparkles size={16} /></span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">{name}</div>
        <div className="flex items-center gap-1 text-[11px] text-white/80">
          {!human && state !== 'offhours' && <span className="h-1.5 w-1.5 rounded-full bg-green-300" />}
          {human && <User size={10} />}
          {status}
        </div>
      </div>
      <Minimize2 size={16} className="text-white/80" />
      <X size={16} className="text-white/80" />
    </div>
  )
}

function IdleBody({ config, C }) {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-end gap-2">
        <Avatar config={config} size={28} />
        <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-3 py-2 text-[13px] leading-snug" style={{ background: C.clientBubble, color: C.clientText }}>
          {config.greeting || 'Hi! How can we help today?'}
        </div>
      </div>
      {config.preChat && (
        <div className="mt-1 rounded-xl p-3" style={{ border: `1px dashed ${C.border}` }}>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: C.sub }}>Before we start</div>
          {['Name', 'Email', 'Topic'].map((f) => (
            <div key={f} className="mb-1.5 rounded-lg px-2.5 py-1.5 text-[12px]" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub }}>{f}</div>
          ))}
        </div>
      )}
      {config.consent && (
        <div className="mt-auto flex items-start gap-1.5 text-[10px]" style={{ color: C.sub }}>
          <ShieldCheck size={12} className="mt-px shrink-0" />
          By chatting you accept our privacy policy. {config.recording !== 'none' && 'Sessions may be recorded.'}
        </div>
      )}
    </div>
  )
}

function Bubble({ who, text, cite, C, primary, config }) {
  const isAgent = who === 'agent'
  return (
    <div className={`flex items-end gap-2 ${isAgent ? '' : 'flex-row-reverse'}`}>
      {isAgent && <Avatar config={config} size={24} />}
      <div className="max-w-[78%]">
        <div
          className={`px-3 py-2 text-[13px] leading-snug ${isAgent ? 'rounded-2xl rounded-bl-sm text-white' : 'rounded-2xl rounded-br-sm'}`}
          style={isAgent ? { background: primary } : { background: C.clientBubble, color: C.clientText }}
        >
          {text}
        </div>
        {cite && (
          <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgba(14,165,233,0.12)', color: '#0EA5E9' }}>
            <ShieldCheck size={10} /> Source: {cite}
          </div>
        )}
      </div>
    </div>
  )
}

function ChatBody({ C, primary, mode, config }) {
  // Human mode shows the same thread plus a human-takeover divider.
  const rows = mode === 'human' ? HTL_TRANSCRIPT : HTL_TRANSCRIPT.slice(0, 3)
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      {rows.map((r, i) => <Bubble key={i} {...r} C={C} primary={primary} config={config} />)}
      {mode === 'human' && (
        <div className="my-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide" style={{ color: C.sub }}>
          <span className="h-px flex-1" style={{ background: C.border }} />
          <span className="inline-flex items-center gap-1"><User size={11} /> María joined</span>
          <span className="h-px flex-1" style={{ background: C.border }} />
        </div>
      )}
      {mode === 'human' ? (
        <div className="flex items-end gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/20 text-[10px] font-semibold text-emerald-600">MG</span>
          <div className="max-w-[78%] rounded-2xl rounded-bl-sm px-3 py-2 text-[13px] leading-snug" style={{ background: C.clientBubble, color: C.clientText, border: '1px solid rgba(16,185,129,0.35)' }}>
            Hi, this is María — I've got your order open and I'll process that refund now.
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1 pl-8">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.2s]" style={{ background: C.sub }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:-0.1s]" style={{ background: C.sub }} />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: C.sub }} />
        </div>
      )}
    </div>
  )
}

function HandoffBody({ config, C, primary }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="relative grid h-16 w-16 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: primary }} />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent" style={{ borderTopColor: primary, borderRightColor: rgba(primary, 0.4) }} />
        <span className="grid h-11 w-11 place-items-center rounded-full text-white" style={{ background: primary }}><User size={20} /></span>
      </div>
      <div>
        <div className="text-[14px] font-semibold" style={{ color: C.text }}>{config.transitionMsg}</div>
        <div className="mt-1 text-[12px]" style={{ color: C.sub }}>
          {config.continuation === 'continuation' ? 'Your AI assistant will stay and resume after.' : 'A specialist is taking over this conversation.'}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/15 text-[12px] font-semibold text-emerald-600">MG</span>
        <div className="text-[12px] font-medium" style={{ color: C.text }}>María González · Specialist</div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {config.showWait && <Pill C={C}>Est. wait ~2 min</Pill>}
        {config.showQueue && <Pill C={C}>Position #3</Pill>}
      </div>
    </div>
  )
}

function Pill({ children, C }) {
  return <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: C.clientBubble, color: C.sub }}>{children}</span>
}

function OffHoursBody({ config, C, primary }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full" style={{ background: rgba(primary, 0.12), color: primary }}><Clock size={22} /></span>
      <div className="text-[14px] font-semibold" style={{ color: C.text }}>We're away right now</div>
      <div className="text-[12px]" style={{ color: C.sub }}>Hours: {config.hours}</div>
      {config.offHours === 'self_service_only' ? (
        <button className="rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: primary }}>Browse self-service help</button>
      ) : (
        <div className="w-full">
          <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]" style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.sub }}>
            <Mail size={14} /> Leave your email
          </div>
          <button className="w-full rounded-lg px-3 py-2 text-[12px] font-semibold text-white" style={{ background: primary }}>Notify me</button>
        </div>
      )}
    </div>
  )
}

function SurveyBody({ config, C, primary }) {
  const nps = config.postSurvey === 'nps'
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-[14px] font-semibold" style={{ color: C.text }}>
        {nps ? 'How likely are you to recommend us?' : 'How was your experience?'}
      </div>
      {nps ? (
        <div className="flex flex-wrap justify-center gap-1">
          {Array.from({ length: 11 }, (_, i) => (
            <span key={i} className="grid h-7 w-7 place-items-center rounded-md text-[12px] font-medium" style={{ border: `1px solid ${C.border}`, color: C.sub }}>{i}</span>
          ))}
        </div>
      ) : (
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={28} style={{ color: i <= 4 ? '#F59E0B' : C.sub, fill: i <= 4 ? '#F59E0B' : 'none' }} />
          ))}
        </div>
      )}
      <button className="rounded-lg px-4 py-2 text-[12px] font-semibold text-white" style={{ background: primary }}>Submit & close</button>
    </div>
  )
}
