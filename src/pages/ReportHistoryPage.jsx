import React, { useState } from 'react'
import { useReports } from '../context/ReportContext.jsx'

export default function ReportHistoryPage({ onNavigate }) {
  const { reports, deleteReport, clearAllReports } = useReports()
  const [expandedId, setExpandedId] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Calculate totals across all reports
  const grandTotalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0)
  const grandTotalItems = reports.reduce((sum, r) => sum + r.totalItems, 0)

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
        {/* Grand totals */}
        {reports.length > 0 && (
          <div className="glass-card rounded-2xl p-4">
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
          </div>
        )}

        {/* Report list */}
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
                  {/* Report header — click to expand */}
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
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-[Fredoka] font-bold text-warm-red text-base">RM{report.totalRevenue.toFixed(2)}</span>
                      <span className={`text-warm-brown/30 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                  </button>

                  {/* Expanded details */}
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

                      {/* Action buttons — side by side */}
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
