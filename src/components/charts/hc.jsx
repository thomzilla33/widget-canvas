// Shared Highcharts layer for AIMS-OS widgets. ONE place for the theme + the
// chart components, used by BOTH the placed tile (WidgetRender) and the builder
// preview (WidgetPreview) — so "preview == placed" stays true on the chart engine.
//
// Highcharts is a commercial library: free to evaluate, but production use needs a
// paid license. Credits watermark is hidden for the demo; that's a licensed feature.
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import SolidGauge from 'highcharts/modules/solid-gauge'
import Funnel from 'highcharts/modules/funnel'
import HeatmapModule from 'highcharts/modules/heatmap'
import { useMemo } from 'react'
import { useTheme } from '../../state/ThemeContext.jsx'

// Register optional modules once. Guard for both factory and side-effect builds.
const apply = (m) => { const f = m && (m.default || m); if (typeof f === 'function') f(Highcharts) }
apply(HighchartsMore)
apply(SolidGauge)
apply(Funnel)
apply(HeatmapModule)

// AIMS-OS series palette — identical to the DOM widgets' SERIES so colors match.
export const SERIES = ['#2563EB', '#06B6D4', '#A78BFA', '#10B981', '#F59E0B', '#EC4899']

// #RRGGBB → rgba() for gradient fills.
const rgba = (hex, a) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// Base, theme-aware options every chart starts from.
function base(dark, height) {
  const grid = dark ? 'rgba(255,255,255,0.08)' : '#eef2f7'
  const axis = dark ? 'rgba(255,255,255,0.10)' : '#e2e8f0'
  const tick = dark ? '#94a3b8' : '#64748b'
  return {
    chart: {
      backgroundColor: 'transparent',
      height,
      spacing: [6, 2, 2, 2],
      style: { fontFamily: 'inherit' },
      animation: { duration: 650 },
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    colors: SERIES,
    tooltip: {
      backgroundColor: dark ? 'rgba(19,26,44,0.97)' : '#ffffff',
      borderColor: dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb',
      borderRadius: 10,
      borderWidth: 1,
      shadow: { color: 'rgba(15,23,42,0.18)', offsetX: 0, offsetY: 4, opacity: 0.5, width: 6 },
      style: { color: dark ? '#e2e8f0' : '#0f172a', fontSize: '12px' },
      useHTML: false,
    },
    xAxis: {
      lineColor: axis, tickColor: axis, tickLength: 4,
      labels: { style: { color: tick, fontSize: '10px' } },
      gridLineWidth: 0,
    },
    yAxis: {
      gridLineColor: grid, gridLineDashStyle: 'Dash',
      labels: { style: { color: tick, fontSize: '10px' } },
      title: { text: null },
    },
    plotOptions: {
      series: {
        animation: { duration: 700 },
        states: { hover: { halo: { size: 5 } }, inactive: { opacity: 0.35 } },
      },
    },
    accessibility: { enabled: false },
  }
}

// Thin wrapper — width fills the tile, options drive everything else.
function HC({ options }) {
  return <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { width: '100%' } }} />
}

export function useDark() {
  const { theme } = useTheme()
  return theme === 'dark'
}

// ── Trend ───────────────────────────────────────────────────────────────────
export function LineHC({ series = [], label, height = 150, axes = true, color = SERIES[0], styleVariant = 'area', displayOptions = {} }) {
  const dark = useDark()
  const options = useMemo(() => {
    const isSmooth  = styleVariant === 'smooth'
    const isArea    = styleVariant === 'area' || styleVariant === ''
    const chartType = isSmooth ? 'spline' : isArea ? 'areaspline' : 'line'
    const withFill  = isArea || isSmooth ? isArea : false
    const showDots    = !!displayOptions.showDots
    const showLabels  = !!displayOptions.showLabels
    const showLegend  = displayOptions.showLegend !== false
    return {
      ...base(dark, height),
      chart: { ...base(dark, height).chart, type: chartType },
      xAxis: { ...base(dark, height).xAxis, categories: series.map((d) => d.x), visible: axes, tickLength: 0 },
      yAxis: { ...base(dark, height).yAxis, visible: axes },
      legend: showLegend
        ? { enabled: true, align: 'center', verticalAlign: 'bottom', itemStyle: { color: dark ? '#cbd5e1' : '#475569', fontSize: '11px' } }
        : { enabled: false },
      series: [{
        name: label, data: series.map((d) => d.y), color, lineWidth: 2.5,
        marker: { enabled: showDots, radius: 4, states: { hover: { enabled: true, radius: 5 } } },
        dataLabels: showLabels ? { enabled: true, style: { fontSize: '10px', fontWeight: '600', textOutline: 'none', color: dark ? '#cbd5e1' : '#374151' } } : { enabled: false },
        fillColor: withFill
          ? { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, rgba(color, 0.26)], [1, rgba(color, 0)]] }
          : 'transparent',
      }],
    }
  }, [dark, series, label, height, axes, color, styleVariant, displayOptions])
  return <HC options={options} />
}

// Tiny sparkline — no axes, no tooltip, just the shape.
export function SparklineHC({ series = [], height = 48, color = SERIES[0] }) {
  const dark = useDark()
  const options = useMemo(() => ({
    ...base(dark, height),
    chart: { ...base(dark, height).chart, type: 'areaspline', margin: [2, 0, 2, 0], animation: false },
    tooltip: { enabled: false },
    xAxis: { visible: false }, yAxis: { visible: false },
    plotOptions: { series: { animation: false, enableMouseTracking: false, marker: { enabled: false }, lineWidth: 2 } },
    series: [{ data: series.map((d) => d.y), color, fillColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, rgba(color, 0.30)], [1, rgba(color, 0)]] } }],
  }), [dark, series, height, color])
  return <HC options={options} />
}

// ── Breakdown ────────────────────────────────────────────────────────────────
export function BarHC({ breakdown = [], label, height = 150, axes = true, styleVariant = 'vertical', displayOptions = {}, accentColor }) {
  const dark = useDark()
  const options = useMemo(() => {
    const isHorizontal = styleVariant === 'horizontal'
    const isStacked    = styleVariant === 'stacked'
    const chartType    = isHorizontal ? 'bar' : 'column'
    const showGrid     = displayOptions.showGrid !== false
    const showLabels   = !!displayOptions.showLabels
    const showLegend   = displayOptions.showLegend !== false
    // Stacked preview: split each bar into two artificial series (60/40) so stacking is visible.
    const series = isStacked
      ? [
        { name: 'Primary',   data: breakdown.map((b) => Math.round(b.value * 0.62)), color: accentColor || SERIES[0] },
        { name: 'Secondary', data: breakdown.map((b) => Math.round(b.value * 0.38)), color: accentColor ? rgba(accentColor, 0.55) : SERIES[1] },
      ]
      : [{ name: label, data: breakdown.map((b) => b.value) }]
    return {
      ...base(dark, height),
      chart: { ...base(dark, height).chart, type: chartType },
      xAxis: { ...base(dark, height).xAxis, categories: breakdown.map((b) => b.label), visible: axes, labels: { ...base(dark, height).xAxis.labels, style: { color: dark ? '#94a3b8' : '#64748b', fontSize: '9px' } } },
      yAxis: { ...base(dark, height).yAxis, visible: axes, gridLineWidth: showGrid ? undefined : 0 },
      legend: isStacked && showLegend
        ? { enabled: true, align: 'center', verticalAlign: 'bottom', itemStyle: { color: dark ? '#cbd5e1' : '#475569', fontSize: '11px' } }
        : { enabled: false },
      plotOptions: {
        [chartType]: {
          colorByPoint: !accentColor && !isStacked,
          color: !isStacked ? (accentColor || undefined) : undefined,
          stacking: isStacked ? 'normal' : undefined,
          borderWidth: 0,
          borderRadius: isHorizontal ? 2 : 3,
          pointPadding: 0.08,
          groupPadding: 0.12,
          dataLabels: { enabled: showLabels, style: { fontSize: '10px', fontWeight: '600', textOutline: 'none', color: dark ? '#cbd5e1' : '#374151' } },
        },
      },
      series,
    }
  }, [dark, breakdown, label, height, axes, styleVariant, displayOptions, accentColor])
  return <HC options={options} />
}

export function PieHC({ breakdown = [], height = 150, inner = '64%', withLegend = false, styleVariant, displayOptions = {} }) {
  const dark = useDark()
  const options = useMemo(() => {
    const effectiveInner  = styleVariant === 'pie' ? '0%' : styleVariant === 'donut' ? '58%' : inner
    const effectiveLegend = displayOptions.showLegend !== undefined ? !!displayOptions.showLegend : withLegend
    const showDataLabels  = displayOptions.showLabels !== false
    return {
      ...base(dark, height),
      chart: { ...base(dark, height).chart, type: 'pie' },
      legend: effectiveLegend ? { enabled: true, align: 'right', verticalAlign: 'middle', layout: 'vertical', itemStyle: { color: dark ? '#cbd5e1' : '#475569', fontSize: '11px', fontWeight: '500' }, itemHoverStyle: { color: dark ? '#fff' : '#0f172a' }, symbolRadius: 6 } : { enabled: false },
      tooltip: { ...base(dark, height).tooltip, pointFormat: '<b>{point.y}</b> ({point.percentage:.0f}%)' },
      plotOptions: { pie: { innerSize: effectiveInner, borderWidth: 2, borderColor: dark ? '#0c1322' : '#ffffff', dataLabels: { enabled: showDataLabels, format: '{point.name}: {point.percentage:.0f}%', style: { fontSize: '10px', fontWeight: '500', textOutline: 'none', color: dark ? '#cbd5e1' : '#374151' } }, showInLegend: effectiveLegend, states: { hover: { brightness: 0.08, halo: { size: 6, opacity: 0.18 } } } } },
      series: [{ data: breakdown.map((b, i) => ({ name: b.label, y: b.value, color: SERIES[i % SERIES.length] })) }],
    }
  }, [dark, breakdown, height, inner, withLegend, styleVariant, displayOptions])
  return <HC options={options} />
}

export function FunnelHC({ breakdown = [], height = 150, labels = true }) {
  const dark = useDark()
  const sorted = useMemo(() => [...breakdown].sort((a, b) => b.value - a.value), [breakdown])
  const options = useMemo(() => ({
    ...base(dark, height),
    chart: { ...base(dark, height).chart, type: 'funnel', marginRight: labels ? 8 : 2 },
    tooltip: { ...base(dark, height).tooltip, pointFormat: '<b>{point.y}</b>' },
    plotOptions: { funnel: { neckWidth: '28%', neckHeight: '26%', borderWidth: 2, borderColor: dark ? '#0c1322' : '#ffffff', dataLabels: { enabled: labels, format: '{point.name}', softConnector: true, style: { color: dark ? '#cbd5e1' : '#475569', fontSize: '10px', fontWeight: '500', textOutline: 'none' }, distance: 6 }, center: ['44%', '50%'], width: labels ? '76%' : '92%', height: '94%' } },
    series: [{ name: 'Stage', data: sorted.map((s, i) => ({ name: s.label, y: s.value, color: SERIES[i % SERIES.length] })) }],
  }), [dark, sorted, height, labels])
  return <HC options={options} />
}

// ── Relationship ───────────────────────────────────────────────────────────
export function ScatterHC({ points = [], height = 150, axes = true }) {
  const dark = useDark()
  const options = useMemo(() => ({
    ...base(dark, height),
    chart: { ...base(dark, height).chart, type: 'scatter' },
    xAxis: { ...base(dark, height).xAxis, visible: axes, gridLineWidth: axes ? 1 : 0, gridLineColor: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' },
    yAxis: { ...base(dark, height).yAxis, visible: axes },
    tooltip: { ...base(dark, height).tooltip, pointFormat: '({point.x}, {point.y})' },
    series: [{ data: points.map((p) => [p.x, p.y]), color: SERIES[2], marker: { radius: 4, symbol: 'circle', fillColor: rgba(SERIES[2], 0.75), lineWidth: 1, lineColor: SERIES[2] } }],
  }), [dark, points, height, axes])
  return <HC options={options} />
}

export function HeatmapHC({ matrix, height = 150, labels = true }) {
  const dark = useDark()
  const options = useMemo(() => {
    const { rows = [], cols = [], cells = [] } = matrix || {}
    const data = []
    cells.forEach((row, ri) => row.forEach((v, ci) => data.push([ci, ri, v])))
    return {
      ...base(dark, height),
      chart: { ...base(dark, height).chart, type: 'heatmap', marginTop: 4, marginBottom: labels ? 24 : 2, plotBorderWidth: 0 },
      xAxis: { categories: cols, visible: labels, lineWidth: 0, tickLength: 0, labels: { style: { color: dark ? '#94a3b8' : '#64748b', fontSize: '9px' } } },
      yAxis: { categories: rows, reversed: true, visible: labels, title: { text: null }, labels: { style: { color: dark ? '#94a3b8' : '#64748b', fontSize: '9px' } } },
      colorAxis: { min: 0, max: 100, minColor: dark ? 'rgba(37,99,235,0.10)' : '#eff6ff', maxColor: '#2563EB' },
      tooltip: { ...base(dark, height).tooltip, pointFormat: '<b>{point.value}</b>' },
      series: [{ borderWidth: 2, borderColor: dark ? '#0c1322' : '#ffffff', data, dataLabels: { enabled: labels, color: '#fff', style: { fontSize: '9px', fontWeight: '600', textOutline: 'none' }, format: '{point.value}', filter: { property: 'value', operator: '>', value: 45 } } }],
    }
  }, [dark, matrix, height, labels])
  return <HC options={options} />
}

// ── Metric ───────────────────────────────────────────────────────────────────
// Solid-gauge arc only; the caller overlays the big number + label (keeps the
// goal/RAG color logic in one place and matches the prior visual).
export function GaugeHC({ value = 0, color = SERIES[0], height = 132 }) {
  const dark = useDark()
  const options = useMemo(() => ({
    ...base(dark, height),
    chart: { ...base(dark, height).chart, type: 'solidgauge' },
    tooltip: { enabled: false },
    pane: { startAngle: -125, endAngle: 125, background: [{ outerRadius: '100%', innerRadius: '70%', backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#eef2f7', borderWidth: 0, shape: 'arc' }] },
    yAxis: { min: 0, max: 100, lineWidth: 0, tickWidth: 0, minorTickWidth: 0, labels: { enabled: false } },
    plotOptions: { solidgauge: { rounded: true, innerRadius: '70%', dataLabels: { enabled: false } } },
    series: [{ data: [{ y: value, color, radius: '100%', innerRadius: '70%' }] }],
  }), [dark, value, color, height])
  return <HC options={options} />
}
