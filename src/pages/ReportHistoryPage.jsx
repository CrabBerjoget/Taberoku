import React, { useState } from 'react'
import { useReports } from '../context/ReportContext.jsx'

function getDailyLabel(dateStr) {
  if (!dateStr) return '?'
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function ReportHistoryPage({ onNavigate }) {
  const { reports, deleteReport, clearAllReports } = useReports()
  const [expandedId, setExpandedId] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [summaryMode, setSummaryMode] = useState('daily')
  const [chartTab, setChartTab] = useState('daily')
  // Chart display filters
  const [showTotal, setShowTotal] = useState(true)
  const [showCash, setShowCash] = useState(false)
  const [showQr, setShowQr] = useState(false)

  // Calculate totals across all reports
  const grandTotalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0)
  const grandTotalItems = reports.reduce((sum, r) => sum + r.totalItems, 0)
  const grandCashTotal = reports.reduce((sum, r) => sum + (r.cashTotal || 0), 0)
  const grandQrTotal = reports.reduce((sum, r) => sum + (r.qrTotal || 0), 0)

  const latestReport = reports.length > 0 ? reports[0] : null

  // --- Daily Chart Data (last 7 days, oldest first) ---
  const dailyData = [...reports].slice(0, 7).reverse().map((r) => ({
    label: getDailyLabel(r.businessDay),
    total: r.totalRevenue || 0,
    cash: r.cashTotal || 0,
    qr: r.qrTotal || 0,
    items: r.totalItems || 0,
  }))

  // --- Weekly Chart Data (last 4 weeks, oldest first) ---
  const getWeeklyData = () => {
    const weeksMap = {}
    reports.forEach((report) => {
      if (!report.businessDay) return
      const date = new Date(report.businessDay + 'T12:00:00')
      const day = date.getDay()
      const diff = date.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(date)
      monday.setDate(diff)
      const mondayStr = monday.toISOString().slice(0, 10)

      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const label = `${monday.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}`

      if (!weeksMap[mondayStr]) {
        weeksMap[mondayStr] = { label, total: 0, cash: 0, qr: 0, items: 0 }
      }
      weeksMap[mondayStr].total += report.totalRevenue || 0
      weeksMap[mondayStr].cash += report.cashTotal || 0
      weeksMap[mondayStr].qr += report.qrTotal || 0
      weeksMap[mondayStr].items += report.totalItems || 0
    })

    return Object.keys(weeksMap)
      .sort()
      .slice(-4)
      .map((key) => weeksMap[key])
  }

  const weeklyData = getWeeklyData()
  const chartData = chartTab === 'daily' ? dailyData : weeklyData

  // Figure out the max value across all enabled series for scaling
  const getMaxVal = () => {
    let max = 0
    chartData.forEach((d) => {
      if (showTotal && d.total > max) max = d.total
      if (showCash && d.cash > max) max = d.cash
      if (showQr && d.qr > max) max = d.qr
    })
    return max || 1
  }
  const maxVal = getMaxVal()

  // If nothing is checked, show a hint
  const nothingChecked = !showTotal && !showCash && !showQr

  // Bar height in pixels (chart area is 140px tall)
  const CHART_H = 140
  const barH = (value) => Math.max(Math.round((value / maxVal) * CHART_H), 4)

  return (
    <div className="min-h-screen font-[Inter]" style={{ background: 'linear-gradient(135deg, #e8d5c4 0%, #f5e6d3 50%, #e8d5c4 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-warm-brown/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('report')}
            className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-white/80 hover:bg-white/25 transition-all text-sm"
          >
            ←
          </button>
          <h1 className="font-[Fredoka] font-bold text-white text-base tracking-wide">📊 Report History</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* ===================== SUMMARY CARD ===================== */}
        {reports.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
            {/* Mode Switcher */}
            <div className="flex rounded-xl bg-warm-brown/10 p-0.5 mb-4">
              <button
                onClick={() => setSummaryMode('daily')}
                className={`flex-1 py-1.5 text-xs font-[Fredoka] font-bold rounded-lg transition-all ${
                  summaryMode === 'daily' ? 'bg-warm-brown text-white shadow-sm' : 'text-warm-brown/60 hover:text-warm-brown'
                }`}
              >
                📅 Daily Summary
              </button>
              <button
                onClick={() => setSummaryMode('allTime')}
                className={`flex-1 py-1.5 text-xs font-[Fredoka] font-bold rounded-lg transition-all ${
                  summaryMode === 'allTime' ? 'bg-warm-brown text-white shadow-sm' : 'text-warm-brown/60 hover:text-warm-brown'
                }`}
              >
                🌍 All-time Summary
              </button>
            </div>

            {summaryMode === 'daily' && latestReport ? (
              <>
                <p className="font-[Caveat] text-warm-brown-light/60 text-base text-center mb-3">
                  {latestReport.date}
                </p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <p className="font-[Fredoka] font-bold text-warm-brown text-xl">{latestReport.totalItems}</p>
                    <p className="font-[Inter] text-warm-brown/40 text-[10px] uppercase tracking-wider">Items sold</p>
                  </div>
                  <div>
                    <p className="font-[Fredoka] font-bold text-warm-red text-xl">RM{latestReport.totalRevenue.toFixed(2)}</p>
                    <p className="font-[Inter] text-warm-brown/40 text-[10px] uppercase tracking-wider">Revenue</p>
                  </div>
                </div>
                {((latestReport.cashTotal || 0) > 0 || (latestReport.qrTotal || 0) > 0) && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-brown/10">
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-600/10">
                      <span className="text-xs">💵</span>
                      <span className="font-[Fredoka] font-bold text-green-700 text-xs">RM{(latestReport.cashTotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600/10">
                      <span className="text-xs">📱</span>
                      <span className="font-[Fredoka] font-bold text-blue-700 text-xs">RM{(latestReport.qrTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="font-[Caveat] text-warm-brown-light/60 text-base text-center mb-3">All-time Summary</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-[Fredoka] font-bold text-warm-brown text-xl">{reports.length}</p>
                    <p className="font-[Inter] text-warm-brown/40 text-[10px] uppercase tracking-wider">Days</p>
                  </div>
                  <div>
                    <p className="font-[Fredoka] font-bold text-warm-brown text-xl">{grandTotalItems}</p>
                    <p className="font-[Inter] text-warm-brown/40 text-[10px] uppercase tracking-wider">Items sold</p>
                  </div>
                  <div>
                    <p className="font-[Fredoka] font-bold text-warm-red text-xl">RM{grandTotalRevenue.toFixed(2)}</p>
                    <p className="font-[Inter] text-warm-brown/40 text-[10px] uppercase tracking-wider">Revenue</p>
                  </div>
                </div>
                {(grandCashTotal > 0 || grandQrTotal > 0) && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-brown/10">
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-green-600/10">
                      <span className="text-xs">💵</span>
                      <span className="font-[Fredoka] font-bold text-green-700 text-xs">RM{grandCashTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600/10">
                      <span className="text-xs">📱</span>
                      <span className="font-[Fredoka] font-bold text-blue-700 text-xs">RM{grandQrTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ===================== CHART CARD ===================== */}
        {reports.length > 0 && (
          <div className="glass-card rounded-2xl p-4 overflow-visible">
            {/* Title + Daily / Weekly toggle */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-[Fredoka] font-bold text-warm-brown text-sm">📈 Sales Analytics</h3>
              <div className="flex bg-warm-brown/10 p-0.5 rounded-lg">
                <button
                  onClick={() => setChartTab('daily')}
                  className={`px-2.5 py-1 text-[10px] font-[Fredoka] font-bold rounded-md transition-all ${
                    chartTab === 'daily' ? 'bg-warm-brown text-white shadow-sm' : 'text-warm-brown/60'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setChartTab('weekly')}
                  className={`px-2.5 py-1 text-[10px] font-[Fredoka] font-bold rounded-md transition-all ${
                    chartTab === 'weekly' ? 'bg-warm-brown text-white shadow-sm' : 'text-warm-brown/60'
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            {/* Checkboxes for which series to show */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showTotal} onChange={() => setShowTotal(!showTotal)}
                  className="w-3.5 h-3.5 rounded accent-amber-700" />
                <span className="text-[10px] font-[Fredoka] font-bold text-warm-brown">Total</span>
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'linear-gradient(to top, #5d4037, #d4a259)' }} />
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showCash} onChange={() => setShowCash(!showCash)}
                  className="w-3.5 h-3.5 rounded accent-green-600" />
                <span className="text-[10px] font-[Fredoka] font-bold text-green-700">💵 Cash</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={showQr} onChange={() => setShowQr(!showQr)}
                  className="w-3.5 h-3.5 rounded accent-blue-600" />
                <span className="text-[10px] font-[Fredoka] font-bold text-blue-700">📱 QR</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
              </label>
            </div>

            {/* Chart Area */}
            {nothingChecked ? (
              <div className="flex items-center justify-center py-10">
                <p className="font-[Fredoka] text-warm-brown/40 text-xs">Select at least one series above ☝️</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="font-[Fredoka] text-warm-brown/40 text-xs">No data to display</p>
              </div>
            ) : (
              <div className="relative px-1">
                {/* Horizontal grid lines (4 lines across the chart area) */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: CHART_H }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="absolute w-full border-t border-warm-brown/8" style={{ top: `${(i / 3) * 100}%` }}>
                      <span className="absolute -top-2 -left-0.5 text-[7px] font-[Inter] text-warm-brown/30">
                        {i === 0 ? `RM${maxVal.toFixed(0)}` : i === 3 ? '0' : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="flex items-end gap-2 justify-around" style={{ height: CHART_H }}>
                  {chartData.map((d, idx) => {
                    const activeBars = []
                    if (showTotal) activeBars.push({ key: 'total', value: d.total, gradient: 'linear-gradient(to top, #5d4037, #d4a259)', hoverColor: '#d4a259' })
                    if (showCash) activeBars.push({ key: 'cash', value: d.cash, gradient: 'linear-gradient(to top, #15803d, #4ade80)', hoverColor: '#22c55e' })
                    if (showQr) activeBars.push({ key: 'qr', value: d.qr, gradient: 'linear-gradient(to top, #1d4ed8, #60a5fa)', hoverColor: '#3b82f6' })

                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
                        {/* Bar group */}
                        <div className="flex items-end gap-[2px] w-full justify-center group relative">
                          {/* Shared tooltip */}
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-warm-brown text-white font-[Fredoka] text-[9px] py-1.5 px-2.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none z-30 flex flex-col items-start gap-0.5">
                            {showTotal && <span><span className="text-amber-300 font-bold">Total:</span> RM{d.total.toFixed(2)}</span>}
                            {showCash && <span><span className="text-green-300 font-bold">Cash:</span> RM{d.cash.toFixed(2)}</span>}
                            {showQr && <span><span className="text-blue-300 font-bold">QR:</span> RM{d.qr.toFixed(2)}</span>}
                            <span className="text-[7px] text-white/50">{d.items} items</span>
                            <div className="w-2 h-2 rotate-45 bg-warm-brown absolute -bottom-1 left-1/2 -translate-x-1/2" />
                          </div>

                          {activeBars.map((bar) => (
                            <div
                              key={bar.key}
                              className="rounded-t-md cursor-pointer transition-all duration-300 hover:opacity-80"
                              style={{
                                height: barH(bar.value),
                                width: activeBars.length === 1 ? 20 : activeBars.length === 2 ? 12 : 8,
                                background: bar.gradient,
                              }}
                            />
                          ))}
                        </div>

                        {/* X axis label */}
                        <span className={`text-[7px] font-[Inter] text-warm-brown/50 mt-1.5 text-center leading-tight ${chartTab === 'weekly' ? 'max-w-[50px]' : ''}`} style={{ wordBreak: 'break-word' }}>
                          {d.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== REPORT LIST ===================== */}
        {reports.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-[Fredoka] text-warm-brown/40 text-base">No reports yet</p>
            <p className="font-[Caveat] text-warm-brown/30 text-lg mt-1">Start logging daily sales!</p>
            <button
              onClick={() => onNavigate('report')}
              className="mt-4 px-5 py-2.5 rounded-xl bg-warm-brown text-white font-[Fredoka] font-bold text-sm hover:bg-warm-brown-light active:scale-95 transition-all"
            >
              📋 New Report
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const isExpanded = expandedId === report.id
              return (
                <div key={report.id} className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors text-left"
                  >
                    <div>
                      <p className="font-[Fredoka] font-bold text-warm-brown text-sm">{report.date}</p>
                      <p className="font-[Inter] text-warm-brown/40 text-xs">
                        {report.totalItems} items
                        {report.lastUpdated && ` · Last updated ${report.lastUpdated}`}
                      </p>
                      {((report.cashTotal || 0) > 0 || (report.qrTotal || 0) > 0) && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {(report.cashTotal || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-green-600/10 font-[Fredoka] text-green-700 text-[10px] font-bold">
                              💵 RM{(report.cashTotal || 0).toFixed(2)}
                            </span>
                          )}
                          {(report.qrTotal || 0) > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600/10 font-[Fredoka] text-blue-700 text-[10px] font-bold">
                              📱 RM{(report.qrTotal || 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[Fredoka] font-bold text-warm-red text-base">RM{report.totalRevenue.toFixed(2)}</span>
                      <span className={`text-warm-brown/30 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-warm-brown/5 animate-slide-up">
                      <div className="space-y-1.5 mt-3">
                        {report.entries.map((entry, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/20">
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-warm-gold/60" />
                              <span className="font-[Inter] text-warm-brown text-xs">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-[Fredoka] text-warm-brown/50 text-xs">× {entry.qty}</span>
                              <span className="font-[Fredoka] font-bold text-warm-brown text-xs">
                                RM{(parseFloat(entry.price.replace(/[^0-9.]/g, '')) * entry.qty).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); onNavigate(`report/edit/${report.id}`) }}
                          className="px-3 py-2 rounded-lg bg-warm-gold/15 font-[Fredoka] text-warm-brown text-xs hover:bg-warm-gold/25 transition-colors flex items-center justify-center gap-1"
                        >
                          ✏️ Edit Report
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteReport(report.id) }}
                          className="px-3 py-2 rounded-lg bg-warm-red/10 font-[Fredoka] text-warm-red text-xs hover:bg-warm-red/20 transition-colors flex items-center justify-center gap-1"
                        >
                          🗑️ Delete Report
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Clear all */}
        {reports.length > 0 && (
          <div className="pt-2 pb-6">
            {showClearConfirm ? (
              <div className="flex items-center gap-2 justify-center">
                <span className="font-[Inter] text-warm-brown text-xs">Delete all reports?</span>
                <button
                  onClick={() => { clearAllReports(); setShowClearConfirm(false) }}
                  className="px-3 py-1.5 rounded-lg bg-warm-red text-white font-[Fredoka] text-xs hover:bg-warm-red-dark transition-colors"
                >
                  Yes, clear
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-warm-brown/10 font-[Fredoka] text-warm-brown text-xs hover:bg-warm-brown/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-2 rounded-xl bg-warm-brown/5 font-[Fredoka] text-warm-brown/40 text-xs hover:bg-warm-brown/10 hover:text-warm-brown/60 transition-all"
              >
                🗑️ Clear all reports
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
